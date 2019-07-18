/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    MainMenuEntriesRequest, AdministrationEvent, AdminCategoriesResponse, AdminModuleCategory, SocketEvent
} from '../core/model';
import { SocketResponse, SocketErrorResponse } from '../core/common';
import { SocketNameSpace } from './SocketNameSpace';
import { AdminModuleService } from '../services';

export class AdministrationNamespace extends SocketNameSpace {

    private static INSTANCE: AdministrationNamespace;

    public static getInstance(): AdministrationNamespace {
        if (!AdministrationNamespace.INSTANCE) {
            AdministrationNamespace.INSTANCE = new AdministrationNamespace();
        }
        return AdministrationNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'administration';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(
            client, AdministrationEvent.LOAD_ADMIN_CATEGORIES, this.loadAdminCategories.bind(this)
        );
    }

    private async loadAdminCategories(
        data: MainMenuEntriesRequest
    ): Promise<SocketResponse> {
        const response = await AdminModuleService.getInstance().getAdminModules(data.token)
            .then((categories: AdminModuleCategory[]) =>
                new SocketResponse(
                    AdministrationEvent.ADMIN_CATEGORIES_LOADED, new AdminCategoriesResponse(data.requestId, categories)
                )
            )
            .catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));
        return response;
    }

}
