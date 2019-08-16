/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../application/IUIModule";
import { ServiceRegistry, FactoryService } from "../../kix";
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, ConfiguredDialogWidget,
    WidgetConfiguration,
    CRUD
} from "../../../model";
import { TableFactoryService } from "../../table";
import { LabelService } from "../../LabelService";
import {
    SysConfigService, SysConfigFormService, SysConfigOptionBrowserFactory,
    SysConfigOptionDefinitionBrowserFactory, SysConfigLabelProvider, EditSysConfigDialogContext,
    SysConfigPlaceholderHandler
} from "../../sysconfig";
import { SysConfigTableFactory } from "../../sysconfig/table";
import { ContextService, DialogService } from "../..";
import { AuthenticationSocketClient } from "../../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../model/UIComponentPermission";
import { PlaceholderService } from "../../placeholder";

export class UIModule implements IUIModule {

    public priority: number = 500;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(new SysConfigPlaceholderHandler());

        ServiceRegistry.registerServiceInstance(SysConfigService.getInstance());
        ServiceRegistry.registerServiceInstance(SysConfigFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.SYS_CONFIG_OPTION, SysConfigOptionBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, SysConfigOptionDefinitionBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new SysConfigTableFactory());
        LabelService.getInstance().registerLabelProvider(new SysConfigLabelProvider());

        // if (await this.checkPermission('system/config/*', CRUD.UPDATE)) {
        const editSysConfigDialogContext = new ContextDescriptor(
            EditSysConfigDialogContext.CONTEXT_ID, [KIXObjectType.SYS_CONFIG_OPTION_DEFINITION],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-sysconfig-dialog', ['sysconfig'], EditSysConfigDialogContext
        );
        ContextService.getInstance().registerContext(editSysConfigDialogContext);

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-sysconfig-dialog',
            new WidgetConfiguration(
                'edit-sysconfig-dialog', 'Translatable#Edit Key',
                [], {}, false, false, 'kix-icon-edit'
            ),
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
            ContextMode.EDIT_ADMIN
        ));
        // }
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }

}
