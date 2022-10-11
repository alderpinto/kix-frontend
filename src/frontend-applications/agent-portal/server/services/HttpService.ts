/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import fs from 'fs';

import { AuthenticationService } from './AuthenticationService';
import { IServerConfiguration } from '../../../../server/model/IServerConfiguration';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { CacheService } from './cache';
import { OptionsResponse } from '../../../../server/model/rest/OptionsResponse';
import { ProfilingService } from '../../../../server/services/ProfilingService';
import { LoggingService } from '../../../../server/services/LoggingService';
import { Error } from '../../../../server/model/Error';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { User } from '../../modules/user/model/User';
import { PermissionError } from '../../modules/user/model/PermissionError';
import { AxiosAdapter, AxiosError, AxiosRequestConfig } from 'axios';
import { SocketAuthenticationError } from '../../modules/base-components/webapp/core/SocketAuthenticationError';
import { RequestCounter } from '../../../../server/services/RequestCounter';

export class HttpService {

    private static INSTANCE: HttpService;

    public static getInstance(): HttpService {
        if (!HttpService.INSTANCE) {
            HttpService.INSTANCE = new HttpService();
        }
        return HttpService.INSTANCE;
    }

    private axios: AxiosAdapter;
    private apiURL: string;
    private isClusterEnabled: boolean = false;
    private backendCertificate: any;
    private requestPromises: Map<string, Promise<any>> = new Map();

    private constructor() {
        const serverConfig: IServerConfiguration = ConfigurationService.getInstance().getServerConfiguration();
        this.apiURL = serverConfig?.BACKEND_API_URL;
        this.isClusterEnabled = serverConfig.CLUSTER_ENABLED;
        this.axios = require('axios');

        const certPath = ConfigurationService.getInstance().certDirectory + '/backend.pem';
        try {
            this.backendCertificate = fs.readFileSync(certPath);
        } catch (error) {
            LoggingService.getInstance().error(error);
        }

        if (serverConfig?.LOG_REQUEST_QUEUES_INTERVAL) {
            setInterval(
                () => LoggingService.getInstance().debug(`HTTP Request Queue Length: ${RequestCounter.getInstance().getPendingHTTPRequestCount()}`),
                serverConfig?.LOG_REQUEST_QUEUES_INTERVAL
            );
        }
    }

    public async get<T>(
        resource: string, queryParameters: any, token: string, clientRequestId: string,
        cacheKeyPrefix: string = '', useCache: boolean = true
    ): Promise<T> {
        const options = {
            method: RequestMethod.GET,
            params: queryParameters
        };

        let cacheKey: string;
        if (useCache) {
            cacheKey = await this.buildCacheKey(resource, queryParameters, token);
            const cachedObject = await CacheService.getInstance().get(cacheKey, cacheKeyPrefix);
            if (cachedObject) {
                return cachedObject;
            }
        }

        const requestKey = await this.buildCacheKey(resource, queryParameters, token, true);

        if (this.requestPromises.has(requestKey)) {
            return this.requestPromises.get(requestKey);
        }


        let semaphor;
        const semaphorKey = cacheKey ? `SEMAPHOR-${cacheKey}` : requestKey;
        if (this.isClusterEnabled && useCache) {
            semaphor = await CacheService.getInstance().get(semaphorKey, semaphorKey);

            if (semaphor) {
                const cachedObject = await CacheService.getInstance().waitFor(cacheKey, cacheKeyPrefix);
                if (cachedObject) {
                    return cachedObject;
                }

                semaphor = null;
            }
        }

        const requestPromise = this.executeRequest<T>(resource, token, clientRequestId, options);
        this.requestPromises.set(requestKey, requestPromise);

        if (this.isClusterEnabled && useCache) {
            await CacheService.getInstance().set(semaphorKey, 1, semaphorKey);
        }

        RequestCounter.getInstance().setPendingHTTPRequestCount(this.requestPromises.size, true);

        const response = await requestPromise.catch((error): any => {
            this.requestPromises.delete(requestKey);
            RequestCounter.getInstance().setPendingHTTPRequestCount(this.requestPromises.size);

            if (this.isClusterEnabled && useCache) {
                CacheService.getInstance().deleteKeys(semaphorKey);
            }

            throw error;
        });

        if (this.isClusterEnabled && useCache) {
            await CacheService.getInstance().deleteKeys(semaphorKey);
        }

        if (useCache) {
            CacheService.getInstance().set(cacheKey, response, cacheKeyPrefix);
        }

        this.requestPromises.delete(requestKey);

        RequestCounter.getInstance().setPendingHTTPRequestCount(this.requestPromises.size);

        return response;
    }

    public async post<T>(
        resource: string, content: any, token: string, clientRequestId: string, cacheKeyPrefix: string = '',
        logError: boolean = true
    ): Promise<T> {
        const options: AxiosRequestConfig = {
            method: RequestMethod.POST,
            data: content
        };

        const response = await this.executeRequest<T>(resource, token, clientRequestId, options, logError);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix).catch(() => null);
        return response;
    }

    public async patch<T>(
        resource: string, content: any, token: string, clientRequestId: string, cacheKeyPrefix: string = ''
    ): Promise<T> {
        const options: AxiosRequestConfig = {
            method: RequestMethod.PATCH,
            data: content
        };

        const response = await this.executeRequest<T>(resource, token, clientRequestId, options);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);
        return response;
    }

    public async delete<T>(
        resources: string[], token: string, clientRequestId: string, cacheKeyPrefix: string = '',
        logError: boolean = true
    ): Promise<Error[]> {
        const options: AxiosRequestConfig = {
            method: RequestMethod.DELETE,
        };

        const errors = [];
        const executePromises = [];
        resources.forEach((resource) => executePromises.push(
            this.executeRequest<T>(resource, token, clientRequestId, options, logError)
                .catch((error: Error) => errors.push(error))
        ));

        await Promise.all(executePromises);
        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);
        return errors;
    }

    public async options(
        token: string, resource: string, content: any, clientRequestId: string, collection: boolean
    ): Promise<OptionsResponse> {
        const options: AxiosRequestConfig = {
            method: RequestMethod.OPTIONS,
            data: content
        };

        const user = await this.getUserByToken(token);
        const cacheId = user.RoleIDs?.sort().join(';');

        const cacheKey = cacheId + resource;
        const cacheType = collection === null || typeof collection === 'undefined' || collection
            ? 'OPTION_COLLECTION'
            : RequestMethod.OPTIONS;

        let headers = await CacheService.getInstance().get(cacheKey, cacheType);
        if (!headers) {
            if (!this.requestPromises.has(cacheKey)) {
                this.requestPromises.set(
                    cacheKey,
                    this.executeRequest<Response>(
                        resource, token, clientRequestId, options, true
                    )
                );
            }

            const request = this.requestPromises.get(cacheKey);
            headers = await request;
            await CacheService.getInstance().set(cacheKey, headers, cacheType);
            this.requestPromises.delete(cacheKey);
        }

        return new OptionsResponse(headers);
    }

    private async executeRequest<T>(
        resource: string, token: string, clientRequestId: string, options: AxiosRequestConfig,
        logError: boolean = true
    ): Promise<T> {
        const backendToken = AuthenticationService.getInstance().getBackendToken(token);

        if (token && !backendToken) {
            throw new SocketAuthenticationError('Invalid Token!');
        }

        // extend options
        options.baseURL = this.apiURL;
        options.url = this.buildRequestUrl(resource);
        options.headers = {
            'Authorization': 'Token ' + backendToken,
            'KIX-Request-ID': clientRequestId ? clientRequestId : ''
        };
        options.maxBodyLength = Infinity;
        options.maxContentLength = Infinity;

        let parameter = '';
        if (options.method === 'GET') {
            parameter = ' ' + JSON.stringify(options.params);
        } else if (options.method === 'POST' || options.method === 'PATCH') {
            if (typeof options.data === 'object') {
                const body = this.getPreparedBody(options.data);
                parameter = ' ' + JSON.stringify(body);
            } else {
                parameter = ' ' + JSON.stringify(options.data);
            }
            parameter = parameter.replace('\\n', '\n');
        }

        // start profiling
        const profileTaskId = ProfilingService.getInstance().start(
            'HttpService',
            options.method + '\t' + resource + '\t' + parameter,
            {
                requestId: clientRequestId,
                data: [options, parameter]
            });

        const response = await this.axios(options).catch((error: AxiosError) => {
            if (logError) {
                LoggingService.getInstance().error(
                    `Error during HTTP (${resource}) ${options.method} request.`, error
                );
            }
            ProfilingService.getInstance().stop(profileTaskId, { data: ['Error'] });
            if (error?.response?.status === 403) {
                throw new PermissionError(this.createError(error), resource, options.method);
            } else if (error?.response?.status === 401) {
                throw new SocketAuthenticationError('Invalid Token!');
            } else {
                throw this.createError(error);
            }
        });

        ProfilingService.getInstance().stop(profileTaskId, { data: [response.data] });

        return options.method === RequestMethod.OPTIONS ? response.headers : response.data;
    }

    private getPreparedBody(body: any): any {
        const newBody = {};
        for (const param in body) {
            if (param.match(/password/i) || param.match(/^UserPw$/)) {
                newBody[param] = '*****';
            } else if (typeof body[param] === 'object') {
                newBody[param] = this.getPreparedBody(body[param]);
            } else {
                newBody[param] = body[param];
            }
        }
        return newBody;
    }

    private buildRequestUrl(resource: string): string {
        let encodedResource = encodeURI(resource);
        encodedResource = encodedResource.replace(/###/g, '%23%23%23');
        return `${this.apiURL}/${encodedResource}`;
    }

    private createError(error: AxiosError): Error {
        const status = error.response?.status;
        if (status === 500) {
            LoggingService.getInstance().error(`(${status}) ${error.response?.statusText}`);
            return new Error(error.response.status?.toString(), error.response?.statusText, status);
        } else {
            const backendError = new BackendHTTPError(error);
            LoggingService.getInstance().error(
                `(${status}) ${backendError.error.Code} ${backendError.error.Message}`
            );
            return new Error(backendError.error.Code?.toString(), backendError.error.Message, status);
        }
    }

    private async buildCacheKey(resource: string, query: any, token: string, useToken?: boolean): Promise<string> {
        let cacheId = token;
        if (!useToken) {
            const user = await this.getUserByToken(token);
            cacheId = user.RoleIDs?.sort().join(';');
        }
        const ordered = {};

        if (query) {
            Object.keys(query).sort().forEach((k) => {
                ordered[k] = query[k];
            });
        }

        const queryString = JSON.stringify(ordered);
        const key = `${cacheId};${resource};${queryString}`;

        return key;
    }

    public async getUserByToken(token: string, withStats?: boolean): Promise<User> {
        const backendToken = AuthenticationService.getInstance().getBackendToken(token);

        const userId = AuthenticationService.getInstance().decodeToken(backendToken)?.UserID;

        const cacheType = withStats
            ? `${KIXObjectType.CURRENT_USER}_STATS_${userId}`
            : `${KIXObjectType.CURRENT_USER}_${userId}`;

        if (userId) {
            const user = await CacheService.getInstance().get(backendToken, cacheType);
            if (user) {
                return user;
            }
        }

        const requestKey = `${KIXObjectType.CURRENT_USER}-${token}`;
        if (this.requestPromises.has(requestKey)) {
            return this.requestPromises.get(requestKey);
        }

        const requestPromise = new Promise<User>(async (resolve, reject) => {
            let params = {};

            if (withStats) {
                params = {
                    'include': 'Tickets',
                    'Tickets.StateType': 'Open'
                };
            } else {
                params = {
                    'include': 'Preferences,RoleIDs,Contact'
                };
            }

            const options: AxiosRequestConfig = { method: RequestMethod.GET, params };

            const uri = 'session/user';
            options.url = this.buildRequestUrl(uri);
            options.headers = {
                'Authorization': 'Token ' + backendToken,
                'KIX-Request-ID': ''
            };

            // start profiling
            const profileTaskId = ProfilingService.getInstance().start(
                'HttpService', options.method + '\t' + uri + '\t' + JSON.stringify(params), { data: [options] }
            );

            const response = await this.axios(options)
                .catch((error: AxiosError) => {
                    LoggingService.getInstance().error(
                        `Error during HTTP (${uri}) ${options.method} request.`, error
                    );
                    ProfilingService.getInstance().stop(profileTaskId, { data: ['Error'] });
                    if (error.response?.status === 403) {
                        throw new PermissionError(this.createError(error), uri, options.method);
                    } else {
                        throw this.createError(error);
                    }
                });

            await CacheService.getInstance().set(backendToken, response.data['User'], cacheType);
            ProfilingService.getInstance().stop(profileTaskId, { data: [response.data] });
            this.requestPromises.delete(requestKey);
            resolve(response.data['User']);
        });

        this.requestPromises.set(requestKey, requestPromise);

        const loadedUser = await requestPromise.catch(() => {
            this.requestPromises.delete(requestKey);
            return null;
        });
        return loadedUser;
    }

    public getPendingRequestCount(): number {
        return this.requestPromises.size;
    }
}

class BackendHTTPError {

    public status: number;

    public error: {
        Code: number,
        Message: string
    };

    public constructor(error: AxiosError) {
        const data = error?.response?.data;
        this.error = { Code: data?.Code, Message: data?.Message };
        this.status = error?.response?.status;
    }

}
