/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from "../SocketClient";
import {
    KIXObject, KIXObjectType, LoadObjectsRequest, KIXObjectEvent,
    LoadObjectsResponse, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    CreateObjectRequest, CreateObjectResponse, KIXObjectSpecificCreateOptions,
    DeleteObjectRequest, DeleteObjectResponse, UpdateObjectRequest, UpdateObjectResponse,
    KIXObjectSpecificDeleteOptions, ISocketResponse, ISocketObjectRequest, Error, SocketEvent
} from "../../model";
import { ClientStorageService } from "../ClientStorageService";
import { IdService } from "../IdService";
import { FactoryService } from "./FactoryService";
import { CacheService } from "../cache";
import { SocketErrorResponse } from "../../common";
import { PermissionError } from "../../model/PermissionError";

export class KIXObjectSocketClient extends SocketClient {

    private static INSTANCE: KIXObjectSocketClient;

    private static TIMEOUT: number;

    public static getInstance(): KIXObjectSocketClient {
        if (!KIXObjectSocketClient.INSTANCE) {
            KIXObjectSocketClient.INSTANCE = new KIXObjectSocketClient();
        }

        const socketTimeout = ClientStorageService.getCookie('socketTimeout');
        KIXObjectSocketClient.TIMEOUT = Number(socketTimeout);

        return KIXObjectSocketClient.INSTANCE;
    }

    private constructor() {
        super();
        this.socket = this.createSocket('kixobjects', true);
    }

    private requestPromises: Map<string, Promise<any>> = new Map();

    public async loadObjects<T extends KIXObject>(
        kixObjectType: KIXObjectType, objectIds: Array<string | number> = null,
        loadingOptions: KIXObjectLoadingOptions = null, objectLoadingOptions: KIXObjectSpecificLoadingOptions = null
    ): Promise<T[]> {
        const token = ClientStorageService.getToken();
        const requestId = IdService.generateDateBasedId();

        const request = new LoadObjectsRequest(
            token, requestId, ClientStorageService.getClientRequestId(),
            kixObjectType, objectIds, loadingOptions, objectLoadingOptions
        );

        const cacheKey = JSON.stringify({ kixObjectType, objectIds, loadingOptions, objectLoadingOptions });

        if (await CacheService.getInstance().has(cacheKey, kixObjectType)) {
            return CacheService.getInstance().get(cacheKey, kixObjectType);
        }

        if (this.requestPromises.has(cacheKey)) {
            return this.requestPromises.get(cacheKey);
        }

        const requestPromise = this.createRequestPromise<T>(request, cacheKey);
        this.requestPromises.set(cacheKey, requestPromise);

        return requestPromise;
    }

    private createRequestPromise<T extends KIXObject>(request: LoadObjectsRequest, cacheKey: string): Promise<T[]> {
        return new Promise<T[]>(async (resolve, reject) => {
            this.sendRequest<LoadObjectsResponse<T>>(
                request,
                KIXObjectEvent.LOAD_OBJECTS, KIXObjectEvent.LOAD_OBJECTS_FINISHED, KIXObjectEvent.LOAD_OBJECTS_ERROR
            ).then(async (response) => {
                const objects = [];
                for (const object of response.objects) {
                    const factoryObject = await FactoryService.getInstance().create<T>(request.objectType, object);
                    objects.push(factoryObject);
                }

                await CacheService.getInstance().set(cacheKey, objects, request.objectType);
                this.requestPromises.delete(cacheKey);
                resolve(objects);
            }).catch(async (error) => {
                this.requestPromises.delete(cacheKey);
                if (error instanceof PermissionError) {
                    await CacheService.getInstance().set(cacheKey, [], request.objectType);
                    resolve([]);
                } else {
                    reject(error);
                }
            });
        });
    }

    public async createObject(
        objectType: KIXObjectType, parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const token = ClientStorageService.getToken();
        const requestId = IdService.generateDateBasedId();

        const request = new CreateObjectRequest(
            token, requestId, ClientStorageService.getClientRequestId(), objectType, parameter, createOptions
        );

        const response = await this.sendRequest<CreateObjectResponse>(
            request,
            KIXObjectEvent.CREATE_OBJECT, KIXObjectEvent.CREATE_OBJECT_FINISHED, KIXObjectEvent.CREATE_OBJECT_ERROR
        );

        CacheService.getInstance().deleteKeys(cacheKeyPrefix);

        return response.result;
    }

    public async updateObject(
        objectType: KIXObjectType, parameter: Array<[string, any]>,
        objectId: number | string, updateOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<string | number> {
        const token = ClientStorageService.getToken();
        const requestId = IdService.generateDateBasedId();

        const request = new UpdateObjectRequest(
            token, requestId, ClientStorageService.getClientRequestId(), objectType, parameter, objectId, updateOptions
        );

        const response = await this.sendRequest<UpdateObjectResponse>(
            request,
            KIXObjectEvent.UPDATE_OBJECT, KIXObjectEvent.UPDATE_OBJECT_FINISHED, KIXObjectEvent.UPDATE_OBJECT_ERROR
        );

        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);

        return response.objectId;
    }

    public async deleteObject(
        objectType: KIXObjectType, objectId: string | number, deleteOptions: KIXObjectSpecificDeleteOptions,
        cacheKeyPrefix: string = objectType
    ): Promise<any> {

        const token = ClientStorageService.getToken();
        const requestId = IdService.generateDateBasedId();

        const request = new DeleteObjectRequest(
            token, requestId, ClientStorageService.getClientRequestId(), objectType, objectId, deleteOptions
        );

        await this.sendRequest<DeleteObjectResponse>(
            request,
            KIXObjectEvent.DELETE_OBJECT, KIXObjectEvent.DELETE_OBJECT_FINISHED, KIXObjectEvent.DELETE_OBJECT_ERROR
        );

        await CacheService.getInstance().deleteKeys(cacheKeyPrefix);
    }

    private async sendRequest<T extends ISocketResponse>(
        requestObject: ISocketObjectRequest, event: string, finishEvent: string, errorEvent: any
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timeout = window.setTimeout(() => {
                const timeoutInSeconds = KIXObjectSocketClient.TIMEOUT / 1000;
                // tslint:disable-next-line:max-line-length
                const error = `Zeitüberschreitung der Anfrage (Event: ${event} - ${requestObject.objectType}) (Timeout: ${timeoutInSeconds} Sekunden)`;
                console.error(error);
                reject(new Error('TIMEOUT', error));
            }, KIXObjectSocketClient.TIMEOUT);

            this.socket.on(finishEvent, (result: T) => {
                if (result.requestId === requestObject.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result);
                }
            });

            this.socket.on(errorEvent, (error: SocketErrorResponse) => {
                if (error.requestId === requestObject.requestId) {
                    window.clearTimeout(timeout);
                    const errorMessage = `Socket Error: Event - ${event}, Object - ${requestObject.objectType}`;
                    console.error(errorMessage);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.on(SocketEvent.PERMISSION_ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestObject.requestId) {
                    window.clearTimeout(timeout);
                    console.error('No permissions');
                    console.error(error.error);
                    const permissionError = error.error as PermissionError;
                    reject(new PermissionError(permissionError, permissionError.resource, permissionError.method));
                }
            });

            this.socket.emit(event, requestObject);
        });
    }

}
