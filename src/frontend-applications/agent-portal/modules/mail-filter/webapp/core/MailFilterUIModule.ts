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
    MailFilterService, MailFilterTableFactory, MailFilterLabelProvider,
    MailFilterMatchTableFactory, MailFilterSetTableFactory, MailFilterCreateAction, NewMailFilterDialogContext,
    MailFilterEditAction, EditMailFilterDialogContext, MailFilterDetailsContext, MailFilterTableDuplicateAction,
    MailFilterDuplicateAction
} from '.';
import { MailFilterFormService } from './MailFilterFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../base-components/webapp/core/table';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { FormValidationService } from '../../../base-components/webapp/core/FormValidationService';
import { MailFilterMatchValidator } from './MailFilterMatchValidator';
import { MailFilterTableDeleteAction } from './actions/MailFilterTableDeleteAction';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';


export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'MailFilterUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(MailFilterService.getInstance());
        ServiceRegistry.registerServiceInstance(MailFilterFormService.getInstance());
        TableFactoryService.getInstance().registerFactory(new MailFilterTableFactory());
        LabelService.getInstance().registerLabelProvider(new MailFilterLabelProvider());
        TableFactoryService.getInstance().registerFactory(new MailFilterMatchTableFactory());
        TableFactoryService.getInstance().registerFactory(new MailFilterSetTableFactory());

        ActionFactory.getInstance().registerAction('mail-filter-create', MailFilterCreateAction);
        ActionFactory.getInstance().registerAction('mail-filter-table-delete',
            MailFilterTableDeleteAction
        );

        const newMailFilterDialogContext = new ContextDescriptor(
            NewMailFilterDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_FILTER],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-mail-account-dialog', ['mail-filters'], NewMailFilterDialogContext,
            [
                new UIComponentPermission('system/communication/mailfilters', [CRUD.CREATE])
            ]
        );
        ContextService.getInstance().registerContext(newMailFilterDialogContext);

        ActionFactory.getInstance().registerAction('mail-filter-edit', MailFilterEditAction);

        FormValidationService.getInstance().registerValidator(new MailFilterMatchValidator());

        const editMailFilterDialogContext = new ContextDescriptor(
            EditMailFilterDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_FILTER],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-mail-filter-dialog', ['mail-filters'], EditMailFilterDialogContext,
            [
                new UIComponentPermission('system/communication/mailfilters', [CRUD.CREATE])
            ]
        );
        ContextService.getInstance().registerContext(editMailFilterDialogContext);

        ActionFactory.getInstance().registerAction('mail-filter-duplicate', MailFilterDuplicateAction);
        ActionFactory.getInstance().registerAction('mail-filter-table-duplicate', MailFilterTableDuplicateAction);

        const mailFilterDetailsContext = new ContextDescriptor(
            MailFilterDetailsContext.CONTEXT_ID, [KIXObjectType.MAIL_FILTER],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['mail-filters'], MailFilterDetailsContext,
            [
                new UIComponentPermission('system/communication/mailfilters', [CRUD.READ])
            ]
        );
        ContextService.getInstance().registerContext(mailFilterDetailsContext);
    }
}
