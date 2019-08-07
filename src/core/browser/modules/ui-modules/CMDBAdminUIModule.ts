/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextService, DialogService, ActionFactory,
    TableFactoryService, LabelService, ServiceRegistry, FactoryService
} from "../../../../core/browser";
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, CRUD
} from "../../../../core/model";
import {
    ConfigItemClassCreateAction, ConfigItemClassEditAction, ConfigItemClassDetailsContext,
    NewConfigItemClassDialogContext, EditConfigItemClassDialogContext, ConfigItemClassTableFactory,
    ConfigItemClassDefinitionTableFactory, ConfigItemClassLabelProvider, ConfigItemClassDefinitionLabelProvider,
    ConfigItemClassService, ConfigItemClassBrowserFactory, ConfigItemClassFormService
} from "../../../../core/browser/cmdb";
import { AuthenticationSocketClient } from "../../../../core/browser/application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../../core/model/UIComponentPermission";
import { IUIModule } from "../../application/IUIModule";

export class UIModule implements IUIModule {

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

        if (await this.checkPermission('system/cmdb/classes', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-create', ConfigItemClassCreateAction);

            const newConfigItemClassDetailsContext = new ContextDescriptor(
                NewConfigItemClassDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                true, 'new-config-item-class-dialog', ['configitemclasses'], NewConfigItemClassDialogContext
            );
            ContextService.getInstance().registerContext(newConfigItemClassDetailsContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-config-item-class-dialog',
                new WidgetConfiguration(
                    'new-config-item-class-dialog', 'Translatable#New Class', [], {}, false, false,
                    'kix-icon-new-gear'
                ),
                KIXObjectType.CONFIG_ITEM_CLASS,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/cmdb/classes/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('cmdb-admin-ci-class-edit', ConfigItemClassEditAction);

            const editConfigItemClassContext = new ContextDescriptor(
                EditConfigItemClassDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                true, 'edit-config-item-class-dialog', ['configitemclasses'], EditConfigItemClassDialogContext
            );
            ContextService.getInstance().registerContext(editConfigItemClassContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-config-item-class-dialog',
                new WidgetConfiguration(
                    'edit-config-item-class-dialog', 'Translatable#Edit Class', [], {},
                    false, false, 'kix-icon-edit'
                ),
                KIXObjectType.CONFIG_ITEM_CLASS,
                ContextMode.EDIT_ADMIN
            ));
        }

        const configItemClassDetailsContext = new ContextDescriptor(
            ConfigItemClassDetailsContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_CLASS],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['configitemclasses'], ConfigItemClassDetailsContext
        );
        ContextService.getInstance().registerContext(configItemClassDetailsContext);
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }

}
