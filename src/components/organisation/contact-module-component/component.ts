import {
    AbstractMarkoComponent, LabelService, ServiceRegistry,
    FactoryService, ContextService, ActionFactory, TableFactoryService
} from '../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, WidgetConfiguration,
    ConfiguredDialogWidget, WidgetSize
} from '../../../core/model';
import {
    ContactTableFactory, ContactLabelProvider, ContactService, ContactBrowserFactory, ContactDetailsContext,
    NewContactDialogContext, ContactSearchContext, ContactSearchAction, ContactCreateAction,
    ContactEditAction, ContactCreateOrganisationAction, ContactPrintAction, ContactCreateTicketAction,
    ContactCreateCIAction, ContactSearchDefinition, EditContactDialogContext, ContactFormService,
    ContactImportDialogContext
} from '../../../core/browser/contact';
import { DialogService } from '../../../core/browser/components/dialog';
import { ImportService } from '../../../core/browser/import';
import { ContactImportManager } from '../../../core/browser/contact/ContactImportManager';
import { KIXObjectSearchService } from '../../../core/browser/kix/search/KIXObjectSearchService';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(ContactService.getInstance());
        ServiceRegistry.registerServiceInstance(ContactFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new ContactTableFactory());
        LabelService.getInstance().registerLabelProvider(new ContactLabelProvider());
        FactoryService.getInstance().registerFactory(KIXObjectType.CONTACT, ContactBrowserFactory.getInstance());
        KIXObjectSearchService.getInstance().registerSearchDefinition(new ContactSearchDefinition());

        ImportService.getInstance().registerImportManager(new ContactImportManager());

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const organisationDetailsContext = new ContextDescriptor(
            ContactDetailsContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['contacts'], ContactDetailsContext
        );
        ContextService.getInstance().registerContext(organisationDetailsContext);

        const newContactContext = new ContextDescriptor(
            NewContactDialogContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-contact-dialog', ['contacts'], NewContactDialogContext
        );
        ContextService.getInstance().registerContext(newContactContext);

        const editContactContext = new ContextDescriptor(
            EditContactDialogContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-contact-dialog', ['contacts'], EditContactDialogContext
        );
        ContextService.getInstance().registerContext(editContactContext);

        const searchContactContext = new ContextDescriptor(
            ContactSearchContext.CONTEXT_ID, [KIXObjectType.CONTACT], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-contact-dialog', ['contacts'], ContactSearchContext
        );
        ContextService.getInstance().registerContext(searchContactContext);

        const contactImportDialogContext = new ContextDescriptor(
            ContactImportDialogContext.CONTEXT_ID, [KIXObjectType.CONTACT],
            ContextType.DIALOG, ContextMode.IMPORT,
            false, 'import-dialog', ['contacts'], ContactImportDialogContext
        );
        ContextService.getInstance().registerContext(contactImportDialogContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-contact-dialog',
            new WidgetConfiguration(
                'new-contact-dialog', 'Translatable#New Contact', [], {}, false, false, 'kix-icon-man-bubble-new'
            ),
            KIXObjectType.CONTACT,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-contact-dialog',
            new WidgetConfiguration(
                'edit-contact-dialog', 'Translatable#Edit Contact', [], {}, false, false, 'kix-icon-edit'
            ),
            KIXObjectType.CONTACT,
            ContextMode.EDIT
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-contact-dialog',
            new WidgetConfiguration(
                'search-contact-dialog',
                'Translatable#Contact Search',
                [],
                {},
                false,
                false,
                'kix-icon-search-man-bubble'
            ),
            KIXObjectType.CONTACT,
            ContextMode.SEARCH
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'contact-import-dialog',
            new WidgetConfiguration(
                'import-dialog', 'Translatable#Import Contacts', [], {}, false, false, 'kix-icon-man-bubble-new'
            ),
            KIXObjectType.CONTACT,
            ContextMode.IMPORT
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('contact-search-action', ContactSearchAction);
        ActionFactory.getInstance().registerAction('contact-create-action', ContactCreateAction);
        ActionFactory.getInstance().registerAction('contact-edit-action', ContactEditAction);
        ActionFactory.getInstance().registerAction('contact-create-contact-action', ContactCreateOrganisationAction);
        ActionFactory.getInstance().registerAction('contact-print-action', ContactPrintAction);
        ActionFactory.getInstance().registerAction('contact-create-ci-action', ContactCreateCIAction);
        ActionFactory.getInstance().registerAction('contact-create-ticket-action', ContactCreateTicketAction);
        ActionFactory.getInstance().registerAction(
            'contact-create-organisation-action', ContactCreateOrganisationAction
        );
    }

}

module.exports = Component;
