import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, LabelService, FactoryService, ActionFactory,
    ContextService, DialogService, InitComponent
} from '../../../core/browser';
import {
    KIXObjectType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, ContextDescriptor, ContextType, CRUD
} from '../../../core/model';
import { TableFactoryService } from '../../../core/browser/table';
import {
    SystemAddressCreateAction, SystemAddressService, SystemAddressFormService, SystemAddressBrowserFactory,
    SystemAddressTableFactory, SystemAddressLabelProvider, NewSystemAddressDialogContext, SystemAddressDetailsContext,
    EditSystemAddressDialogContext, SystemAddressEditAction
} from '../../../core/browser/system-address';
import {
    MailAccountService, MailAccountBrowserFactory, MailAccountTableFactory, MailAccountLabelProvider,
    NewMailAccountDialogContext, MailAccountDetailsContext, EditMailAccountDialogContext
} from '../../../core/browser/mail-account';
import { MailAccountFormService } from '../../../core/browser/mail-account/MailAccountFormService';
import { MailAccountCreateAction } from '../../../core/browser/mail-account/actions';
import { MailAccountEditAction } from '../../../core/browser/mail-account/actions/MailAccountEditAction';
import {
    MailFilterService, MailFilterBrowserFactory, MailFilterTableFactory, MailFilterLabelProvider
} from '../../../core/browser/mail-filter';
import { UIComponentPermission } from '../../../core/model/UIComponentPermission';
import { AuthenticationSocketClient } from '../../../core/browser/application/AuthenticationSocketClient';

class Component extends AbstractMarkoComponent implements InitComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async init(): Promise<void> {
        ServiceRegistry.registerServiceInstance(SystemAddressService.getInstance());
        ServiceRegistry.registerServiceInstance(SystemAddressFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.SYSTEM_ADDRESS, SystemAddressBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new SystemAddressTableFactory());
        LabelService.getInstance().registerLabelProvider(new SystemAddressLabelProvider());

        ServiceRegistry.registerServiceInstance(MailAccountService.getInstance());
        ServiceRegistry.registerServiceInstance(MailAccountFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.MAIL_ACCOUNT, MailAccountBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new MailAccountTableFactory());
        LabelService.getInstance().registerLabelProvider(new MailAccountLabelProvider());

        ServiceRegistry.registerServiceInstance(MailFilterService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.MAIL_FILTER, MailFilterBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new MailFilterTableFactory());
        LabelService.getInstance().registerLabelProvider(new MailFilterLabelProvider());

        await this.registerSystemAddresses();
        await this.registerMailAccounts();
        await this.registerMailFilters();
    }

    private async registerSystemAddresses(): Promise<void> {

        if (await this.checkPermission('system/communication/systemaddresses', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('system-address-create', SystemAddressCreateAction);

            const newSystemAddressDialogContext = new ContextDescriptor(
                NewSystemAddressDialogContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-system-address-dialog', ['system-addresses'], NewSystemAddressDialogContext
            );
            ContextService.getInstance().registerContext(newSystemAddressDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-system-address-dialog',
                new WidgetConfiguration(
                    'new-system-address-dialog', 'Translatable#New Address',
                    [], {}, false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.SYSTEM_ADDRESS,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/communication/systemaddresses/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('system-address-edit', SystemAddressEditAction);

            const editSystemAddressDialogContext = new ContextDescriptor(
                EditSystemAddressDialogContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-system-address-dialog', ['system-addresses'], EditSystemAddressDialogContext
            );
            ContextService.getInstance().registerContext(editSystemAddressDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-system-address-dialog',
                new WidgetConfiguration(
                    'edit-system-address-dialog', 'Translatable#Edit Address',
                    [], {}, false, false, 'kix-icon-edit'
                ),
                KIXObjectType.SYSTEM_ADDRESS,
                ContextMode.EDIT_ADMIN
            ));
        }

        const systemAddressDetailsContext = new ContextDescriptor(
            SystemAddressDetailsContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['system-addresses'], SystemAddressDetailsContext
        );
        ContextService.getInstance().registerContext(systemAddressDetailsContext);
    }

    private async registerMailAccounts(): Promise<void> {

        if (await this.checkPermission('system/communication/mailaccounts', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('mail-account-create', MailAccountCreateAction);

            const newMailAccountDialogContext = new ContextDescriptor(
                NewMailAccountDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-mail-account-dialog', ['mail-accounts'], NewMailAccountDialogContext
            );
            ContextService.getInstance().registerContext(newMailAccountDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-mail-account-dialog',
                new WidgetConfiguration(
                    'new-mail-account-dialog', 'Translatable#New Email Account',
                    [], {}, false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.MAIL_ACCOUNT,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/communication/mailaccounts/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('mail-account-edit', MailAccountEditAction);

            const editMailAccountDialogContext = new ContextDescriptor(
                EditMailAccountDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-mail-account-dialog', ['mail-accounts'], EditMailAccountDialogContext
            );
            ContextService.getInstance().registerContext(editMailAccountDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-mail-account-dialog',
                new WidgetConfiguration(
                    'edit-mail-account-dialog', 'Translatable#Edit Account',
                    [], {}, false, false, 'kix-icon-edit'
                ),
                KIXObjectType.MAIL_ACCOUNT,
                ContextMode.EDIT_ADMIN
            ));
        }

        const mailAccountDetailsContext = new ContextDescriptor(
            MailAccountDetailsContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['mail-accounts'], MailAccountDetailsContext
        );
        ContextService.getInstance().registerContext(mailAccountDetailsContext);
    }

    private async registerMailFilters(): Promise<void> {

        if (await this.checkPermission('system/communication/mailfilters', CRUD.CREATE)) {
            // ActionFactory.getInstance().registerAction('mail-filter-create', MailFilterCreateAction);

        }

        if (await this.checkPermission('system/communication/mailfilters/*', CRUD.UPDATE)) {
            // ActionFactory.getInstance().registerAction('mail-filter-edit', MailFilterEditAction);

        }

    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }
}

module.exports = Component;
