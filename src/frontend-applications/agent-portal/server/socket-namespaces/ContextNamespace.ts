/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from "./SocketNameSpace";
import { ContextEvent } from "../../modules/base-components/webapp/core/ContextEvent";
import {
    LoadContextConfigurationRequest
} from "../../modules/base-components/webapp/core/LoadContextConfigurationRequest";
import { SocketResponse } from "../../modules/base-components/webapp/core/SocketResponse";
import {
    LoadContextConfigurationResponse
} from "../../modules/base-components/webapp/core/LoadContextConfigurationResponse";
import { SocketErrorResponse } from "../../modules/base-components/webapp/core/SocketErrorResponse";
import { ModuleConfigurationService } from "../services/configuration";
import { SocketEvent } from "../../modules/base-components/webapp/core/SocketEvent";
import { PermissionService } from "../services/PermissionService";
import { ContextConfiguration } from "../../model/configuration/ContextConfiguration";
import { ContextConfigurationResolver } from "../services/configuration/ContextConfigurationResolver";

export class ContextNamespace extends SocketNameSpace {

    private static INSTANCE: ContextNamespace;

    public static getInstance(): ContextNamespace {
        if (!ContextNamespace.INSTANCE) {
            ContextNamespace.INSTANCE = new ContextNamespace();
        }
        return ContextNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'context';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(
            client, ContextEvent.LOAD_CONTEXT_CONFIGURATION, this.loadContextConfiguration.bind(this)
        );
    }

    protected async loadContextConfiguration(
        data: LoadContextConfigurationRequest
    ): Promise<SocketResponse<LoadContextConfigurationResponse<any> | SocketErrorResponse>> {
        let configuration = await ModuleConfigurationService.getInstance().loadConfiguration(
            data.token, data.contextId
        );

        if (!configuration) {
            return new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(
                data.requestId, `No configuration extension for context ${data.contextId} available.`
            ));
        }

        configuration = await PermissionService.getInstance().filterContextConfiguration(
            data.token, configuration as ContextConfiguration
        ).catch(() => configuration);

        configuration = await ContextConfigurationResolver.getInstance().resolve(
            data.token, configuration as ContextConfiguration);


        const response = new LoadContextConfigurationResponse(data.requestId, configuration as ContextConfiguration);
        return new SocketResponse(ContextEvent.CONTEXT_CONFIGURATION_LOADED, response);
    }

}