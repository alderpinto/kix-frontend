/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import {
    CMDBService, ConfigItemFormService, ConfigItemTableFactory,
    ConfigItemVersionTableFactory, CompareConfigItemVersionTableFactory, ConfigItemHistoryTableFactory,
    ConfigItemLabelProvider, ConfigItemClassLabelProvider, ConfigItemClassDefinitionLabelProvider,
    ConfigItemHistoryLabelProvider, ConfigItemVersionLabelProvider, ConfigItemVersionCompareLabelProvider,
    ConfigItemSearchDefinition, CMDBContext, ConfigItemDetailsContext, ConfigItemSearchContext,
    CompareConfigItemVersionDialogContext, ConfigItemVersionCompareAction
} from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactoryService, TableCSSHandlerRegistry } from '../../../base-components/webapp/core/table';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { SearchService } from '../../../search/webapp/core';
import { PostproductivCSSHandler } from './table/PostproductivCSSHandler';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';

export class UIModule implements IUIModule {

    public name: string = 'CMDBReadUIModule';

    public priority: number = 200;

    public unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(CMDBService.getInstance());
        ServiceRegistry.registerServiceInstance(ConfigItemFormService.getInstance());

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
        ContextService.getInstance().registerContext(cmdbContext);

        const configItemDetailsContext = new ContextDescriptor(
            ConfigItemDetailsContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['configitems'], ConfigItemDetailsContext,
            [
                new UIComponentPermission('cmdb/configitems', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(configItemDetailsContext);

        const searchConfigItemContext = new ContextDescriptor(
            ConfigItemSearchContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-config-item-dialog', ['configitems'], ConfigItemSearchContext,

            [
                new UIComponentPermission('cmdb/configitems', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(searchConfigItemContext);

        const compareConfigItemContext = new ContextDescriptor(
            CompareConfigItemVersionDialogContext.CONTEXT_ID, [KIXObjectType.CONFIG_ITEM_VERSION_COMPARE],
            ContextType.DIALOG, ContextMode.EDIT,
            false, 'compare-config-item-version-dialog', ['configitems'], CompareConfigItemVersionDialogContext,

            [
                new UIComponentPermission('cmdb/configitems', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(compareConfigItemContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction(
            'config-item-version-compare-action', ConfigItemVersionCompareAction
        );
    }

}
