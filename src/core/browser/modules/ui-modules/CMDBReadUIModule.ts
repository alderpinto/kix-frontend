/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ServiceRegistry, FactoryService, LabelService,
    TableFactoryService, ContextService, ActionFactory
} from "../../../../core/browser";
import {
    CMDBService, ConfigItemBrowserFactory, ConfigItemClassBrowserFactory,
    ConfigItemImageBrowserFactory, ConfigItemTableFactory, ConfigItemVersionTableFactory,
    CompareConfigItemVersionTableFactory,
    ConfigItemHistoryTableFactory, ConfigItemLabelProvider, ConfigItemClassLabelProvider,
    ConfigItemHistoryLabelProvider, ConfigItemVersionLabelProvider, ConfigItemClassDefinitionLabelProvider,
    ConfigItemVersionCompareLabelProvider, ConfigItemSearchDefinition, CMDBContext, ConfigItemDetailsContext,
    ConfigItemSearchContext, CompareConfigItemVersionDialogContext,
    ConfigItemVersionCompareAction, ConfigItemFormService, ConfigItemHistoryBrowserFactory
} from "../../../../core/browser/cmdb";
import { KIXObjectType, ContextDescriptor, ContextType, ContextMode } from "../../../../core/model";
import { SearchService } from "../../../../core/browser/kix/search/SearchService";
import { IUIModule } from "../../application/IUIModule";
import { TableCSSHandlerRegistry } from "../../table";
import { PostproductivCSSHandler } from "../../cmdb/table/PostproductivCSSHandler";

export class UIModule implements IUIModule {

    public priority: number = 200;

    public name: string = 'CMDBReadUIModule';

    public unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(CMDBService.getInstance());
        ServiceRegistry.registerServiceInstance(ConfigItemFormService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONFIG_ITEM, ConfigItemBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONFIG_ITEM_HISTORY, ConfigItemHistoryBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONFIG_ITEM_CLASS, ConfigItemClassBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.CONFIG_ITEM_IMAGE, ConfigItemImageBrowserFactory.getInstance()
        );

        TableFactoryService.getInstance().registerFactory(new ConfigItemTableFactory());
        TableFactoryService.getInstance().registerFactory(new ConfigItemVersionTableFactory());
        TableFactoryService.getInstance().registerFactory(new CompareConfigItemVersionTableFactory());
        TableFactoryService.getInstance().registerFactory(new ConfigItemHistoryTableFactory());

        LabelService.getInstance().registerLabelProvider(new ConfigItemLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemClassLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemClassDefinitionLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemHistoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemVersionLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ConfigItemVersionCompareLabelProvider());

        SearchService.getInstance().registerSearchDefinition(new ConfigItemSearchDefinition());

        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.CONFIG_ITEM, new PostproductivCSSHandler()
        );

        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const cmdbContext = new ContextDescriptor(
            CMDBContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'cmdb-module', ['configitems'], CMDBContext
        );
        await ContextService.getInstance().registerContext(cmdbContext);

        const configItemDetailsContext = new ContextDescriptor(
            ConfigItemDetailsContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['configitems'], ConfigItemDetailsContext
        );
        await ContextService.getInstance().registerContext(configItemDetailsContext);

        const searchConfigItemContext = new ContextDescriptor(
            ConfigItemSearchContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-config-item-dialog', ['configitems'], ConfigItemSearchContext
        );
        await ContextService.getInstance().registerContext(searchConfigItemContext);

        const compareConfigItemContext = new ContextDescriptor(
            CompareConfigItemVersionDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_VERSION_COMPARE],
            ContextType.DIALOG, ContextMode.EDIT,
            false, 'compare-config-item-version-dialog', ['configitems'], CompareConfigItemVersionDialogContext
        );
        await ContextService.getInstance().registerContext(compareConfigItemContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction(
            'config-item-version-compare-action', ConfigItemVersionCompareAction
        );
    }

}
