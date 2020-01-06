/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import {
    ConfigItemClassService, ConfigItemClassFormService, ConfigItemClassBrowserFactory,
    ConfigItemClassTableFactory, ConfigItemClassDefinitionTableFactory, ConfigItemClassLabelProvider,
    ConfigItemClassDefinitionLabelProvider, ConfigItemClassCreateAction, NewConfigItemClassDialogContext,
    ConfigItemClassEditAction, EditConfigItemClassDialogContext, ConfigItemClassDetailsContext
} from ".";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TableFactoryService } from "../../../base-components/webapp/core/table";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { CRUD } from "../../../../../../server/model/rest/CRUD";
import { ActionFactory } from "../../../../modules/base-components/webapp/core/ActionFactory";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { AuthenticationSocketClient } from "../../../../modules/base-components/webapp/core/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../../model/UIComponentPermission";

export class UIModule implements IUIModule {

    public name: string = 'CMDBAdminUIModule';

    public priority: number = 204;

    public unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {

        ServiceRegistry.registerServiceInstance(ConfigItemClassService.getInstance());
        ServiceRegistry.registerServiceInstance(ConfigItemClassFormService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONFIG_ITEM_CLASS, ConfigItemClassBrowserFactory.getInstance()
        );

        TableFactoryService.getInstance().registerFactory(new ConfigItemClassTableFactory());
        TableFactoryService.getInstance().registerFactory(new ConfigItemClassDefinitionTableFactory());
        LabelService.getInstance().registerLabelProvider(new ConfigItemClassLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemClassDefinitionLabelProvider());

        ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-create', ConfigItemClassCreateAction);

        const newConfigItemClassDetailsContext = new ContextDescriptor(
            NewConfigItemClassDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            true, 'new-config-item-class-dialog', ['configitemclasses'], NewConfigItemClassDialogContext
        );
        await ContextService.getInstance().registerContext(newConfigItemClassDetailsContext);

        ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-edit', ConfigItemClassEditAction);

        const editConfigItemClassContext = new ContextDescriptor(
            EditConfigItemClassDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            true, 'edit-config-item-class-dialog', ['configitemclasses'], EditConfigItemClassDialogContext
        );
        await ContextService.getInstance().registerContext(editConfigItemClassContext);

        const configItemClassDetailsContext = new ContextDescriptor(
            ConfigItemClassDetailsContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['configitemclasses'], ConfigItemClassDetailsContext
        );
        await ContextService.getInstance().registerContext(configItemClassDetailsContext);
    }

}
