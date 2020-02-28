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
import { ContextEvent } from "./ContextEvent";
import { LoadContextConfigurationResponse } from "./LoadContextConfigurationResponse";
import { LoadContextConfigurationRequest } from "./LoadContextConfigurationRequest";
import { SocketErrorResponse } from "./SocketErrorResponse";
import { SocketEvent } from "./SocketEvent";
import { ContextConfiguration } from "../../../../model/configuration/ContextConfiguration";
import { IdService } from "../../../../model/IdService";
import { ISocketRequest } from "./ISocketRequest";
import { ISocketResponse } from "./ISocketResponse";

export class ContextSocketClient extends SocketClient {

    public static getInstance(): ContextSocketClient {
        if (!ContextSocketClient.INSTANCE) {
            ContextSocketClient.INSTANCE = new ContextSocketClient();
        }

        return ContextSocketClient.INSTANCE;
    }

    private static INSTANCE: ContextSocketClient = null;

    private constructor() {
        super();
        this.socket = this.createSocket('context', true);
    }

    public async loadContextConfiguration(contextId: string): Promise<ContextConfiguration> {
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<ContextConfiguration>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.LOAD_CONTEXT_CONFIGURATION);
            }, socketTimeout);

            this.socket.on(ContextEvent.CONTEXT_CONFIGURATION_LOADED,
                (result: LoadContextConfigurationResponse<ContextConfiguration>) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.contextConfiguration);
                    }
                }
            );

            this.socket.emit(
                ContextEvent.LOAD_CONTEXT_CONFIGURATION, new LoadContextConfigurationRequest(
                    token, requestId, ClientStorageService.getClientRequestId(), contextId
                )
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });
        });
    }

    public async loadContextConfigurations(): Promise<ContextConfiguration[]> {
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<ContextConfiguration[]>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.LOAD_CONTEXT_CONFIGURATIONS);
            }, socketTimeout);

            this.socket.on(ContextEvent.CONTEXT_CONFIGURATIONS_LOADED,
                (result) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.configurations);
                    }
                }
            );

            const request: ISocketRequest = {
                token,
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };
            this.socket.emit(ContextEvent.LOAD_CONTEXT_CONFIGURATIONS, request);

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });
        });
    }

    public async rebuildConfiguration(): Promise<void> {
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + ContextEvent.REBUILD_CONFIG);
            }, socketTimeout);

            this.socket.on(ContextEvent.REBUILD_CONFIG_FINISHED,
                (result: ISocketResponse) => {
                    if (result.requestId === requestId) {
                        window.clearTimeout(timeout);
                        resolve();
                    }
                }
            );

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                token,
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };

            this.socket.emit(ContextEvent.REBUILD_CONFIG, request);
        });
    }
}
