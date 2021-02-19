/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from './SocketClient';
import { ClientStorageService } from './ClientStorageService';
import { LoadKIXModulesRequest } from './LoadKIXModulesRequest';
import { KIXModulesEvent } from './KIXModulesEvent';
import { LoadKIXModulesResponse } from './LoadKIXModulesResponse';
import { SocketErrorResponse } from './SocketErrorResponse';
import { SocketEvent } from './SocketEvent';
import { LoadFormConfigurationsRequest } from './LoadFormConfigurationsRequest';
import { LoadFormConfigurationsResponse } from './LoadFormConfigurationsResponse';
import { LoadReleaseInfoResponse } from './LoadReleaseInfoResponse';
import { ISocketRequest } from './ISocketRequest';
import { LoadFormConfigurationRequest } from './LoadFormConfigurationRequest';
import { LoadFormConfigurationResponse } from './LoadFormConfigurationResponse';
import { IKIXModuleExtension } from '../../../../model/IKIXModuleExtension';
import { IdService } from '../../../../model/IdService';
import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { ReleaseInfo } from '../../../../model/ReleaseInfo';
import { ISocketResponse } from './ISocketResponse';

export class KIXModulesSocketClient extends SocketClient {

    public static getInstance(): KIXModulesSocketClient {
        if (!KIXModulesSocketClient.INSTANCE) {
            KIXModulesSocketClient.INSTANCE = new KIXModulesSocketClient();
        }

        return KIXModulesSocketClient.INSTANCE;
    }

    private static INSTANCE: KIXModulesSocketClient = null;

    public constructor() {
        super();
        this.socket = this.createSocket('kixmodules', true);
    }

    public async loadModules(): Promise<IKIXModuleExtension[]> {

        return new Promise<IKIXModuleExtension[]>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const request = new LoadKIXModulesRequest(requestId, ClientStorageService.getClientRequestId());

            this.socket.on(KIXModulesEvent.LOAD_MODULES_FINISHED, (result: LoadKIXModulesResponse) => {
                if (requestId === result.requestId) {
                    resolve(result.modules);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(KIXModulesEvent.LOAD_MODULES, request);
        });
    }

    public async loadFormConfigurations(
    ): Promise<Array<[FormContext, KIXObjectType | string, string]>> {
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<Array<[FormContext, KIXObjectType | string, string]>>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const request = new LoadFormConfigurationsRequest(
                requestId, ClientStorageService.getClientRequestId()
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_FORM_CONFIGURATIONS);
            }, socketTimeout);

            this.socket.on(KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_FINISHED,
                (result: LoadFormConfigurationsResponse) => {
                    if (requestId === result.requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.formIDsWithContext);
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

            this.socket.emit(KIXModulesEvent.LOAD_FORM_CONFIGURATIONS, request);
        });
    }

    public async loadFormConfiguration(formId: string): Promise<FormConfiguration> {
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<FormConfiguration>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const request = new LoadFormConfigurationRequest(
                requestId, ClientStorageService.getClientRequestId(), formId
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_FORM_CONFIGURATION);
            }, socketTimeout);

            this.socket.on(KIXModulesEvent.LOAD_FORM_CONFIGURATION_FINISHED,
                (result: LoadFormConfigurationResponse) => {
                    if (requestId === result.requestId) {
                        window.clearTimeout(timeout);
                        resolve(result.form);
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

            this.socket.emit(KIXModulesEvent.LOAD_FORM_CONFIGURATION, request);
        });
    }


    public async loadReleaseConfig(): Promise<ReleaseInfo> {
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<ReleaseInfo>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.LOAD_RELEASE_INFO);
            }, socketTimeout);

            this.socket.on(KIXModulesEvent.LOAD_RELEASE_INFO_FINISHED, (result: LoadReleaseInfoResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.releaseInfo);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };
            this.socket.emit(KIXModulesEvent.LOAD_RELEASE_INFO, request);
        });
    }

    public async rebuildConfiguration(): Promise<void> {
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {

            const requestId = IdService.generateDateBasedId();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + KIXModulesEvent.REBUILD_FORM_CONFIG);
            }, socketTimeout);

            this.socket.on(KIXModulesEvent.REBUILD_FORM_CONFIG_FINISHED,
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
                requestId,
                clientRequestId: ClientStorageService.getClientRequestId()
            };

            this.socket.emit(KIXModulesEvent.REBUILD_FORM_CONFIG, request);
        });
    }
}
