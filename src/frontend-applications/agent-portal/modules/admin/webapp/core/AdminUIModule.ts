/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { AdministrationSocketClient } from './AdministrationSocketClient';
import { AdminContext } from './AdminContext';
import { ContextType } from '../../../../model/ContextType';
import { IUIModule } from '../../../../model/IUIModule';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AdminModuleCategory } from '../../model/AdminModuleCategory';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';

export class UIModule implements IUIModule {

    public priority: number = 500;

    public name: string = 'AdminUIModule';

    public unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        const contextDescriptor = new ContextDescriptor(
            AdminContext.CONTEXT_ID, [
            KIXObjectType.CONFIG_ITEM_CLASS,
            KIXObjectType.GENERAL_CATALOG_ITEM,
            KIXObjectType.NOTIFICATION,
            KIXObjectType.SYSTEM_ADDRESS,
            KIXObjectType.MAIL_ACCOUNT,
            KIXObjectType.MAIL_FILTER,
            KIXObjectType.WEBFORM,
            KIXObjectType.TRANSLATION,
            KIXObjectType.FAQ_CATEGORY,
            KIXObjectType.SYS_CONFIG_OPTION,
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
            KIXObjectType.TICKET_PRIORITY,
            KIXObjectType.TICKET_STATE,
            KIXObjectType.QUEUE,
            KIXObjectType.TEXT_MODULE,
            KIXObjectType.TICKET_TYPE,
            KIXObjectType.USER,
            KIXObjectType.ROLE,
            KIXObjectType.PERMISSION,
            KIXObjectType.JOB,
            KIXObjectType.IMPORT_EXPORT_TEMPLATE,
            KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN
        ],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'admin', ['admin'], AdminContext,
            [
                new UIComponentPermission('system/config/FQDN', [CRUD.UPDATE])
            ]
        );
        ContextService.getInstance().registerContext(contextDescriptor);
    }

}
