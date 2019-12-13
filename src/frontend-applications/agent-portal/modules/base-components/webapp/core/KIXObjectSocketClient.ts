/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from "./SocketClient";
import { ClientStorageService } from "./ClientStorageService";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { KIXObjectSpecificLoadingOptions } from "../../../../model/KIXObjectSpecificLoadingOptions";
import { IdService } from "../../../../model/IdService";
import { LoadObjectsRequest } from "./LoadObjectsRequest";
import { BrowserCacheService } from "./CacheService";
import { LoadObjectsResponse } from "./LoadObjectsResponse";
import { KIXObjectEvent } from "./KIXObjectEvent";
import { FactoryService } from "./FactoryService";
import { PermissionError } from "../../../user/model/PermissionError";
import { KIXObjectSpecificCreateOptions } from "../../../../model/KIXObjectSpecificCreateOptions";
import { CreateObjectRequest } from "./CreateObjectRequest";
import { CreateObjectResponse } from "./CreateObjectResponse";
import { UpdateObjectRequest } from "./UpdateObjectRequest";
import { UpdateObjectResponse } from "./UpdateObjectResponse";
import { KIXObjectSpecificDeleteOptions } from "../../../../model/KIXObjectSpecificDeleteOptions";
import { DeleteObjectRequest } from "./DeleteObjectRequest";
import { DeleteObjectResponse } from "./DeleteObjectResponse";
import { ISocketResponse } from "./ISocketResponse";
import { ISocketObjectRequest } from "./ISocketObjectRequest";
import { SocketErrorResponse } from "./SocketErrorResponse";
import { SocketEvent } from "./SocketEvent";
import { Error } from "../../../../../../server/model/Error";

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

    public async loadObjects<T extends KIXObject>(
        kixObjectType: KIXObjectType | string, objectIds: Array<string | number> = null,
        loadingOptions: KIXObjectLoadingOptions = null, objectLoadingOptions: KIXObjectSpecificLoadingOptions = null,
        cache: boolean = true
    ): Promise<T[]> {
        const token = ClientStorageService.getToken();
        const requestId = IdService.generateDateBasedId();

        const request = new LoadObjectsRequest(
            token, requestId, ClientStorageService.getClientRequestId(),
            kixObjectType, objectIds, loadingOptions, objectLoadingOptions
        );

        const cacheKey = JSON.stringify({ kixObjectType, objectIds, loadingOptions, objectLoadingOptions });

        let requestPromise: Promise<T[]>;
        if (cache) {
            requestPromise = await BrowserCacheService.getInstance().get(cacheKey, kixObjectType);
            if (!requestPromise) {
                requestPromise = this.createRequestPromise<T>(request);
                BrowserCacheService.getInstance().set(cacheKey, requestPromise, kixObjectType);
            }
            return requestPromise;
        }

        requestPromise = this.createRequestPromise<T>(request);
        return requestPromise;
    }

    private createRequestPromise<T extends KIXObject>(request: LoadObjectsRequest): Promise<T[]> {
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

                resolve(objects);
            }).catch(async (error) => {
                if (error instanceof PermissionError) {
                    resolve([]);
                } else {
                    reject(error);
                }
            });
        });
    }

    public async createObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions,
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

        BrowserCacheService.getInstance().deleteKeys(cacheKeyPrefix);

        return response.result;
    }

    public async updateObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]>,
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

        BrowserCacheService.getInstance().deleteKeys(cacheKeyPrefix);

        return response.objectId;
    }

    public async deleteObject(
        objectType: KIXObjectType | string, objectId: string | number, deleteOptions: KIXObjectSpecificDeleteOptions,
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

        BrowserCacheService.getInstance().deleteKeys(cacheKeyPrefix);
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