import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { IHttpService } from './IHttpService';
import { IServerConfiguration, HttpError } from './../model/';

export class HttpService implements IHttpService {

    private axios: AxiosInstance;

    private apiURL: string;

    public constructor() {
        const serverConfig: IServerConfiguration = require('../../server.config.json');
        this.apiURL = serverConfig.BACKEND_API_URL;
        this.axios = require('axios');
    }

    public async get(resource: string, queryParameters: any = {}): Promise<any> {
        return await this.axios.get(this.buildRequestUrl(resource), { params: queryParameters })
            .then((response: AxiosResponse) => {
                return response.data;
            }).catch((error: AxiosError) => {
                return this.createHttpError(error);
            });
    }

    public async post(resource: string, content: any): Promise<any> {
        return await this.axios.post(this.buildRequestUrl(resource), content)
            .then((response: AxiosResponse) => {
                return response.data;
            }).catch((error: AxiosError) => {
                return this.createHttpError(error);
            });
    }

    public async put(resource: string, content: any): Promise<string> {
        return await this.axios.put(this.buildRequestUrl(resource), content)
            .then((response: AxiosResponse) => {
                return response.data;
            }).catch((error: AxiosError) => {
                return this.createHttpError(error);
            });
    }

    public async patch(resource: string, content: any): Promise<string> {
        return await this.axios.patch(this.buildRequestUrl(resource), content)
            .then((response: AxiosResponse) => {
                return response.data;
            }).catch((error: AxiosError) => {
                return this.createHttpError(error);
            });
    }

    public async delete(resource: string): Promise<any> {
        return await this.axios.delete(this.buildRequestUrl(resource))
            .then((response: AxiosResponse) => {
                return response.data;
            }).catch((error: AxiosError) => {
                return this.createHttpError(error);
            });
    }

    private buildRequestUrl(resource: string): string {
        return `${this.apiURL}/${resource}`;
    }

    private createHttpError(err: AxiosError): HttpError {
        return new HttpError(err.response.status, err.response.data);
    }

}
