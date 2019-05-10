import { IServerConfiguration } from '../../../common';

import fs = require('fs');
import { ConfigurationService } from '../ConfigurationService';
import { LoggingService } from '../LoggingService';
import { ProfilingService } from '../ProfilingService';
import { Error } from '../../../model';
import { AuthenticationService } from './AuthenticationService';
import { CacheService } from '../../../cache';
import { PermissionError } from '../../../model/PermissionError';
import { OptionsResponse, RequestMethod } from '../../../api';

export class HttpService {

    private static INSTANCE: HttpService;

    public static getInstance(): HttpService {
        if (!HttpService.INSTANCE) {
            HttpService.INSTANCE = new HttpService();
        }
        return HttpService.INSTANCE;
    }

    private request: any;
    private apiURL: string;
    private backendCertificate: any;

    private requestPromises: Map<string, Promise<any>> = new Map();

    private constructor() {
        const serverConfig: IServerConfiguration = ConfigurationService.getInstance().getServerConfiguration();
        this.apiURL = serverConfig.BACKEND_API_URL;
        this.request = require('request-promise');

        const certPath = ConfigurationService.getInstance().certDirectory + '/backend.pem';
        this.backendCertificate = fs.readFileSync(certPath);
    }

    public async get<T>(
        resource: string, queryParameters: any, token: any, clientRequestId: string,
        cacheKeyPrefix: string = '', useCache: boolean = true
    ): Promise<T> {
        const options = {
            method: RequestMethod.GET,
            qs: queryParameters
        };

        let cacheKey: string;
        if (useCache) {
            cacheKey = this.buildCacheKey(resource, queryParameters, token);
            if (await CacheService.getInstance().has(cacheKey, cacheKeyPrefix)) {
                return await CacheService.getInstance().get(cacheKey, cacheKeyPrefix);
            }
        }

        const requestKey = this.buildCacheKey(resource, queryParameters, token);

        if (this.requestPromises.has(requestKey)) {
            return this.requestPromises.get(requestKey);
        }

        const requestPromise = this.executeRequest<T>(resource, token, clientRequestId, options);

        this.requestPromises.set(requestKey, requestPromise);

        requestPromise
            .then((response) => {
                if (useCache) {
                    CacheService.getInstance().set(cacheKey, response, cacheKeyPrefix);
                }
                this.requestPromises.delete(requestKey);
            })
            .catch(() => this.requestPromises.delete(requestKey));

        return requestPromise;
    }

    public async post<T>(
        resource: string, content: any, token: any, clientRequestId: string, cacheKeyPrefix: string = ''
    ): Promise<T> {
        const options = {
            method: RequestMethod.POST,
            body: content
        };

        const response = this.executeRequest<T>(resource, token, clientRequestId, options);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);
        return response;
    }

    public async patch<T>(
        resource: string, content: any, token: any, clientRequestId: string, cacheKeyPrefix: string = ''
    ): Promise<T> {
        const options = {
            method: RequestMethod.PATCH,
            body: content
        };

        const response = this.executeRequest<T>(resource, token, clientRequestId, options);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);
        return response;
    }

    public async delete<T>(
        resource: string, token: any, clientRequestId: string, cacheKeyPrefix: string = ''
    ): Promise<T> {
        const options = {
            method: RequestMethod.DELETE,
        };

        const response = this.executeRequest<T>(resource, token, clientRequestId, options);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);
        return response;
    }

    public async options(token: string, resource: string): Promise<OptionsResponse> {
        const options = {
            method: RequestMethod.OPTIONS
        };

        const response = this.executeRequest(resource, token, null, options);
        return new OptionsResponse(response);
    }

    private executeRequest<T>(
        resource: string, token: string, clientRequestId: string, options: any
    ): Promise<T> {
        const backendToken = AuthenticationService.getInstance().getBackendToken(token);

        // extend options
        options.uri = this.buildRequestUrl(resource);
        options.headers = {
            'Authorization': 'Token ' + backendToken,
            'KIX-Request-ID': clientRequestId
        };
        options.json = true;
        options.ca = this.backendCertificate;

        let parameter = '';
        if (options.method === 'GET') {
            parameter = ' ' + JSON.stringify(options.qs);
        } else if (options.method === 'POST' || options.method === 'PATCH') {
            if (typeof options.body === 'object') {
                const body = {};
                for (const param in options.body) {
                    if (param.match(/password/i)) {
                        body[param] = '*****';
                    } else {
                        body[param] = options.body[param];
                    }
                }
                parameter = ' ' + JSON.stringify(body);
            } else {
                parameter = ' ' + JSON.stringify(options.body);
            }
            parameter = parameter.replace('\\n', '\n');
        }

        // start profiling
        const profileTaskId = ProfilingService.getInstance().start(
            'HttpService',
            options.method + ' ' + resource + parameter,
            {
                a: options,
                b: parameter
            });

        return new Promise((resolve, reject) => {
            this.request(options)
                .then((response) => {
                    resolve(response);
                    ProfilingService.getInstance().stop(profileTaskId, response);
                }).catch((error) => {
                    LoggingService.getInstance().error('Error during HTTP ' + options.method + ' request.', error);
                    if (error.statusCode === 403) {
                        reject(new PermissionError(this.createError(error), resource, options.method));
                    } else {
                        reject(this.createError(error));
                    }
                });
        });
    }

    private buildRequestUrl(resource: string): string {
        return `${this.apiURL}/${resource}`;
    }

    private createError(err: any): Error {
        LoggingService.getInstance().error(`(${err.statusCode}) ${err.error.Code}  ${err.error.Message}`);
        return new Error(err.error.Code, err.error.Message, err.statusCode);
    }

    private buildCacheKey(resource: string, query: any, token: string): string {
        const ordered = {};

        if (query) {
            Object.keys(query).sort().forEach((k) => {
                ordered[k] = query[k];
            });
        }

        const queryString = JSON.stringify(ordered);
        const key = `${token};${resource};${queryString}`;

        return key;
    }

}
