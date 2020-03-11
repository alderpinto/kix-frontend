/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { ActionFactory } from "../../../../modules/base-components/webapp/core/ActionFactory";
import {
    WebformCreateAction, WebformEditAction, WebformFormService, WebformBrowserFactory,
    WebformTableFactory, WebformLabelProvider, NewWebformDialogContext, WebformDetailsContext, EditWebformDialogContext
} from ".";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TableFactoryService } from "../../../base-components/webapp/core/table";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { WebformService } from "./WebformService";

export class UIModule implements IUIModule {

    public name: string = 'WebformUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public priority: number = 9999;

    public async register(): Promise<void> {
        ActionFactory.getInstance().registerAction('webform-create-action', WebformCreateAction);
        ActionFactory.getInstance().registerAction('webform-edit-action', WebformEditAction);

        ServiceRegistry.registerServiceInstance(WebformService.getInstance());
        ServiceRegistry.registerServiceInstance(WebformFormService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.WEBFORM, WebformBrowserFactory.getInstance()
        );

        TableFactoryService.getInstance().registerFactory(new WebformTableFactory());
        LabelService.getInstance().registerLabelProvider(new WebformLabelProvider());

        const newWebformDialogContext = new ContextDescriptor(
            NewWebformDialogContext.CONTEXT_ID, [KIXObjectType.WEBFORM],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-webform-dialog', ['webforms'], NewWebformDialogContext
        );
        await ContextService.getInstance().registerContext(newWebformDialogContext);

        const webformDetailsContext = new ContextDescriptor(
            WebformDetailsContext.CONTEXT_ID, [KIXObjectType.WEBFORM],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['webforms'], WebformDetailsContext
        );
        await ContextService.getInstance().registerContext(webformDetailsContext);

        const editWebformDialogContext = new ContextDescriptor(
            EditWebformDialogContext.CONTEXT_ID, [KIXObjectType.WEBFORM],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-webform-dialog', ['webforms'], EditWebformDialogContext
        );
        await ContextService.getInstance().registerContext(editWebformDialogContext);
    }

}
