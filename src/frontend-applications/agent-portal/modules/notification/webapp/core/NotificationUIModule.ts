/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import {
    NotificationService, NotificationTableFactory, NotificationLabelProvider, NotificationBrowserFactory,
    NotificationEmailRecipientValidator, NotificationFilterValidator, NotificationFormService,
    NotificationFilterTableFactory, NotificationCreateAction, NewNotificationDialogContext,
    NotificationEditAction, EditNotificationDialogContext, NotificationDetailsContext
} from ".";
import { TableFactoryService } from "../../../base-components/webapp/core/table";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { FormValidationService } from "../../../../modules/base-components/webapp/core/FormValidationService";
import { ActionFactory } from "../../../../modules/base-components/webapp/core/ActionFactory";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";

export class UIModule implements IUIModule {

    public name: string = 'NotificationUIModule';

    public priority: number = 9500;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(NotificationService.getInstance());
        TableFactoryService.getInstance().registerFactory(new NotificationTableFactory());
        LabelService.getInstance().registerLabelProvider(new NotificationLabelProvider());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.NOTIFICATION, NotificationBrowserFactory.getInstance()
        );

        FormValidationService.getInstance().registerValidator(new NotificationEmailRecipientValidator());
        FormValidationService.getInstance().registerValidator(new NotificationFilterValidator());

        ServiceRegistry.registerServiceInstance(NotificationFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new NotificationFilterTableFactory());

        ActionFactory.getInstance().registerAction('notification-create', NotificationCreateAction);
        const newNotificationDialogContext = new ContextDescriptor(
            NewNotificationDialogContext.CONTEXT_ID, [KIXObjectType.NOTIFICATION],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-notification-dialog', ['notifications'], NewNotificationDialogContext
        );
        await ContextService.getInstance().registerContext(newNotificationDialogContext);

        ActionFactory.getInstance().registerAction('notification-edit', NotificationEditAction);
        const editNotificationDialogContext = new ContextDescriptor(
            EditNotificationDialogContext.CONTEXT_ID, [KIXObjectType.NOTIFICATION],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-notification-dialog', ['notifications'], EditNotificationDialogContext
        );
        await ContextService.getInstance().registerContext(editNotificationDialogContext);

        const notificationDetailsContext = new ContextDescriptor(
            NotificationDetailsContext.CONTEXT_ID, [KIXObjectType.NOTIFICATION],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['notifications'], NotificationDetailsContext
        );
        await ContextService.getInstance().registerContext(notificationDetailsContext);
    }

    public unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
