import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, ServiceRegistry, LabelService, FactoryService,
    FormValidationService, ContextService, ActionFactory, KIXObjectSearchService
} from '../../../core/browser';
import {
    TicketService, TicketHistoryLabelProvider, ArticleLabelProvider, TicketLabelProvider, TicketTableFactory,
    TicketHistoryTableFactory, PendingTimeValidator, TicketBrowserFactory, ArticleBrowserFactory, TicketFormService,
    TicketContext, TicketDetailsContext, NewTicketDialogContext, TicketSearchContext, EditTicketDialogContext,
    NewTicketArticleContext, TicketListContext, ArticleZipAttachmentDownloadAction, ArticleBulkAction,
    ArticleCallIncomingAction, ArticleCallOutgoingAction, ArticleCommunicationAction, ArticleEditAction,
    ArticleMaximizeAction, ArticleNewEmailAction, ArticleNewNoteAction, ArticlePrintAction, ArticleTagAction,
    TicketEditAction, TicketLockAction, TicketMergeAction, TicketCreateAction, TicketPrintAction, TicketSpamAction,
    TicketWatchAction, TicketSearchAction, ShowUserTicketsAction, TicketSearchDefinition, TicketTypeCreateAction,
    TicketTypeImportAction, TicketTypeDeleteAction, TicketTypeTableFactory, TicketTypeLabelProvider,
    TicketTypeBrowserFactory, TicketTypeDetailsContext, TicketTypeTableDeleteAction, TicketPriorityImportAction,
    TicketPriorityTableDeleteAction, TicketPriorityDeleteAction, TicketPriorityTableFactory,
    TicketPriorityLabelProvider, TicketPriorityBrowserFactory, EditTicketTypeDialogContext,
    TicketTypeEditTextmodulesAction, TicketStateService, TicketStateLabelProvider, TicketStateTypeLabelProvider,
    TicketStateTableFactory, TicketStateBrowserFactory, TicketStateTypeBrowserFactory, TicketStateCreateAction,
    TicketStateTableDeleteAction, TicketStateImportAction, TicketStateDetailsContext, TicketStateEditTextmodulesAction,
    TicketStateEditAction, TicketStateDuplicateAction, TicketStateDeleteAction, TicketPriorityCreateAction,
    TicketTypeDuplicateAction, TicketTypeEditAction, NewTicketTypeDialogContext, TicketTypeFormService,
    TicketTypeService, TicketPriorityService, TicketPriorityDetailsContext, TicketPriorityEditAction,
    TicketPriorityDuplicateAction, NewTicketPriorityDialogContext, NewTicketStateDialogContext,
    EditTicketPriorityDialogContext, TicketPriorityFormService, EditTicketStateDialogContext,
    TicketStateFormService, TicketBulkManager, TicketTableCSSHandler, ArticleTableCSSHandler, EmailRecipientValidator,
    TicketTemplateCreateAction, TicketTemplateTableDeleteAction, TicketTemplateLabelProvider, TicketTemplateService,
    TicketTemplateBrowserFactory, TicketTemplateTableFactory, TicketQueueCreateAction, TicketQueueTableFactory,
    QueueLabelProvider, QueueBrowserFactory, QueueService
} from '../../../core/browser/ticket';
import {
    KIXObjectType, ContextDescriptor, ContextMode, ContextType,
    ConfiguredDialogWidget, WidgetConfiguration, WidgetSize
} from '../../../core/model';
import { BulkService } from '../../../core/browser/bulk';
import { ArticleTableFactory } from '../../../core/browser/ticket/table/ArticleTableFactory';
import { ChannelService } from '../../../core/browser/channel';
import { TableFactoryService, TableCSSHandlerRegistry } from '../../../core/browser/table';
import { ChannelLabelProvider } from '../../../core/browser/channel/ChannelLabelProvider';
import { DialogService } from '../../../core/browser/components/dialog';

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TicketService.getInstance());
        ServiceRegistry.registerServiceInstance(ChannelService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketTypeService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketStateService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketPriorityService.getInstance());
        ServiceRegistry.registerServiceInstance(QueueService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketTemplateService.getInstance());

        ServiceRegistry.registerServiceInstance(TicketFormService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketTypeFormService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketPriorityFormService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketStateFormService.getInstance());

        KIXObjectSearchService.getInstance().registerSearchDefinition(new TicketSearchDefinition());

        LabelService.getInstance().registerLabelProvider(new TicketLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ArticleLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketHistoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketPriorityLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketStateTypeLabelProvider());
        LabelService.getInstance().registerLabelProvider(new ChannelLabelProvider());
        LabelService.getInstance().registerLabelProvider(new QueueLabelProvider());
        LabelService.getInstance().registerLabelProvider(new TicketTemplateLabelProvider());

        TableFactoryService.getInstance().registerFactory(new TicketTableFactory());
        TableFactoryService.getInstance().registerFactory(new ArticleTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketHistoryTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketTypeTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketPriorityTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketStateTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketQueueTableFactory());
        TableFactoryService.getInstance().registerFactory(new TicketTemplateTableFactory());

        TableCSSHandlerRegistry.getInstance().registerCSSHandler(KIXObjectType.TICKET, new TicketTableCSSHandler());
        TableCSSHandlerRegistry.getInstance().registerCSSHandler(KIXObjectType.ARTICLE, new ArticleTableCSSHandler());

        FormValidationService.getInstance().registerValidator(new PendingTimeValidator());
        FormValidationService.getInstance().registerValidator(new EmailRecipientValidator());

        FactoryService.getInstance().registerFactory(KIXObjectType.TICKET, TicketBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.ARTICLE, ArticleBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.TICKET_TYPE, TicketTypeBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_PRIORITY, TicketPriorityBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_STATE, TicketStateBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_STATE_TYPE, TicketStateTypeBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.QUEUE, QueueBrowserFactory.getInstance()
        );
        FactoryService.getInstance().registerFactory(
            KIXObjectType.TICKET_TEMPLATE, TicketTemplateBrowserFactory.getInstance()
        );

        TicketFormService.getInstance();
        TicketTypeFormService.getInstance();

        BulkService.getInstance().registerBulkManager(new TicketBulkManager());

        this.registerContexts();
        this.registerAdminContexts();
        this.registerTicketActions();
        this.registerTicketAdminActions();
        this.registerTicketDialogs();
        this.registerTicketAdminDialogs();
    }

    private registerContexts(): void {
        const ticketContext = new ContextDescriptor(
            TicketContext.CONTEXT_ID, [KIXObjectType.TICKET, KIXObjectType.ARTICLE],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'tickets', ['tickets'], TicketContext
        );
        ContextService.getInstance().registerContext(ticketContext);

        const ticketDetailsContextDescriptor = new ContextDescriptor(
            TicketDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET, KIXObjectType.ARTICLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['tickets'], TicketDetailsContext
        );
        ContextService.getInstance().registerContext(ticketDetailsContextDescriptor);

        const newTicketContext = new ContextDescriptor(
            NewTicketDialogContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-ticket-dialog', ['tickets'], NewTicketDialogContext
        );
        ContextService.getInstance().registerContext(newTicketContext);

        const searchContext = new ContextDescriptor(
            TicketSearchContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-ticket-dialog', ['tickets'], TicketSearchContext
        );
        ContextService.getInstance().registerContext(searchContext);

        const editTicketContext = new ContextDescriptor(
            EditTicketDialogContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-ticket-dialog', ['tickets'], EditTicketDialogContext
        );
        ContextService.getInstance().registerContext(editTicketContext);

        const newTicketArticleContext = new ContextDescriptor(
            NewTicketArticleContext.CONTEXT_ID, [KIXObjectType.ARTICLE], ContextType.DIALOG, ContextMode.CREATE_SUB,
            true, 'new-ticket-article-dialog', ['articles'], NewTicketArticleContext
        );
        ContextService.getInstance().registerContext(newTicketArticleContext);

        const ticketListContext = new ContextDescriptor(
            TicketListContext.CONTEXT_ID, [KIXObjectType.TICKET], ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'ticket-list-module', ['ticket-list'], TicketListContext
        );
        ContextService.getInstance().registerContext(ticketListContext);
    }

    private registerAdminContexts(): void {
        const ticketTypeDetailsContextDescriptor = new ContextDescriptor(
            TicketTypeDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['tickettypes'], TicketTypeDetailsContext
        );
        ContextService.getInstance().registerContext(ticketTypeDetailsContextDescriptor);

        const newTicketTypeContext = new ContextDescriptor(
            NewTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-ticket-type-dialog', ['tickettypes'], NewTicketTypeDialogContext
        );
        ContextService.getInstance().registerContext(newTicketTypeContext);

        const editTicketTypeContext = new ContextDescriptor(
            EditTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-ticket-type-dialog', ['tickettypes'], EditTicketTypeDialogContext
        );
        ContextService.getInstance().registerContext(editTicketTypeContext);

        const ticketStateDetailsContextDescriptor = new ContextDescriptor(
            TicketStateDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['ticketstates'], TicketStateDetailsContext
        );
        ContextService.getInstance().registerContext(ticketStateDetailsContextDescriptor);

        const newTicketStateContext = new ContextDescriptor(
            NewTicketStateDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-ticket-state-dialog', ['ticketstates'], NewTicketStateDialogContext
        );
        ContextService.getInstance().registerContext(newTicketStateContext);

        const editTicketStateContext = new ContextDescriptor(
            EditTicketStateDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-ticket-state-dialog', ['ticketstates'], EditTicketStateDialogContext
        );
        ContextService.getInstance().registerContext(editTicketStateContext);

        const ticketPriorityDetailsContextDescriptor = new ContextDescriptor(
            TicketPriorityDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['priorities'], TicketPriorityDetailsContext
        );
        ContextService.getInstance().registerContext(ticketPriorityDetailsContextDescriptor);

        const newTicketPriorityContext = new ContextDescriptor(
            NewTicketPriorityDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-ticket-priority-dialog', ['priorities'], NewTicketPriorityDialogContext
        );
        ContextService.getInstance().registerContext(newTicketPriorityContext);

        const editTicketPriorityContext = new ContextDescriptor(
            EditTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-ticket-priority-dialog', ['priorities'], EditTicketPriorityDialogContext
        );
        ContextService.getInstance().registerContext(editTicketPriorityContext);
    }

    private registerTicketActions(): void {
        ActionFactory.getInstance()
            .registerAction('article-attachment-zip-download', ArticleZipAttachmentDownloadAction);
        ActionFactory.getInstance().registerAction('article-bulk-action', ArticleBulkAction);
        ActionFactory.getInstance().registerAction('article-call-incoming-action', ArticleCallIncomingAction);
        ActionFactory.getInstance().registerAction('article-call-outgoing-action', ArticleCallOutgoingAction);
        ActionFactory.getInstance().registerAction('article-communication-action', ArticleCommunicationAction);
        ActionFactory.getInstance().registerAction('article-edit-action', ArticleEditAction);
        ActionFactory.getInstance().registerAction('article-maximize-action', ArticleMaximizeAction);
        ActionFactory.getInstance().registerAction('article-new-email-action', ArticleNewEmailAction);
        ActionFactory.getInstance().registerAction('article-new-note-action', ArticleNewNoteAction);
        ActionFactory.getInstance().registerAction('article-print-action', ArticlePrintAction);
        ActionFactory.getInstance().registerAction('article-tag-action', ArticleTagAction);

        ActionFactory.getInstance().registerAction('ticket-edit-action', TicketEditAction);
        ActionFactory.getInstance().registerAction('ticket-lock-action', TicketLockAction);
        ActionFactory.getInstance().registerAction('ticket-merge-action', TicketMergeAction);
        ActionFactory.getInstance().registerAction('ticket-create-action', TicketCreateAction);
        ActionFactory.getInstance().registerAction('ticket-print-action', TicketPrintAction);
        ActionFactory.getInstance().registerAction('ticket-spam-action', TicketSpamAction);
        ActionFactory.getInstance().registerAction('ticket-watch-action', TicketWatchAction);
        ActionFactory.getInstance().registerAction('ticket-search-action', TicketSearchAction);

        ActionFactory.getInstance().registerAction('show-user-tickets', ShowUserTicketsAction);
    }

    private registerTicketAdminActions(): void {
        ActionFactory.getInstance().registerAction('ticket-admin-type-create', TicketTypeCreateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-type-table-delete', TicketTypeTableDeleteAction);
        ActionFactory.getInstance().registerAction('ticket-admin-type-import', TicketTypeImportAction);
        ActionFactory.getInstance().registerAction('ticket-admin-type-edit', TicketTypeEditAction);
        ActionFactory.getInstance().registerAction('ticket-admin-type-duplication', TicketTypeDuplicateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-type-delete', TicketTypeDeleteAction);
        ActionFactory.getInstance().registerAction(
            'ticket-admin-type-textmodules-edit', TicketTypeEditTextmodulesAction
        );

        ActionFactory.getInstance().registerAction('ticket-admin-priority-create', TicketPriorityCreateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-priority-table-delete',
            TicketPriorityTableDeleteAction
        );
        ActionFactory.getInstance().registerAction('ticket-admin-priority-import', TicketPriorityImportAction);
        ActionFactory.getInstance().registerAction('ticket-admin-priority-delete', TicketPriorityDeleteAction);
        ActionFactory.getInstance().registerAction('ticket-admin-priority-edit', TicketPriorityEditAction);
        ActionFactory.getInstance().registerAction('ticket-admin-priority-duplication', TicketPriorityDuplicateAction);

        ActionFactory.getInstance().registerAction('ticket-admin-state-create', TicketStateCreateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-table-delete', TicketStateTableDeleteAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-import', TicketStateImportAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-edit', TicketStateEditAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-duplication', TicketStateDuplicateAction);
        ActionFactory.getInstance().registerAction('ticket-admin-state-delete', TicketStateDeleteAction);
        ActionFactory.getInstance().registerAction(
            'ticket-admin-state-textmodules-edit', TicketStateEditTextmodulesAction
        );

        ActionFactory.getInstance().registerAction('ticket-admin-queue-create', TicketQueueCreateAction);

        ActionFactory.getInstance().registerAction('ticket-admin-template-create', TicketTemplateCreateAction);
        ActionFactory.getInstance().registerAction(
            'ticket-admin-template-table-delete', TicketTemplateTableDeleteAction
        );
    }

    private registerTicketDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-dialog',
            new WidgetConfiguration(
                'new-ticket-dialog', 'Translatable#New Ticket', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-new-ticket'
            ),
            KIXObjectType.TICKET,
            ContextMode.CREATE
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-ticket-dialog',
            new WidgetConfiguration(
                'search-ticket-dialog', 'Translatable#Ticket Search', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-search-ticket'
            ),
            KIXObjectType.TICKET,
            ContextMode.SEARCH
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-ticket-dialog',
            new WidgetConfiguration(
                'edit-ticket-dialog', 'Translatable#Edit Ticket', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-edit'
            ),
            KIXObjectType.TICKET,
            ContextMode.EDIT
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-article-dialog',
            new WidgetConfiguration(
                'new-ticket-article-dialog', 'Translatable#New Article', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-new-note'
            ),
            KIXObjectType.ARTICLE,
            ContextMode.CREATE_SUB
        ));
    }

    private registerTicketAdminDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-type-dialog',
            new WidgetConfiguration(
                'new-ticket-type-dialog', 'Translatable#New Type', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-new-gear'
            ),
            KIXObjectType.TICKET_TYPE,
            ContextMode.CREATE_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-ticket-type-dialog',
            new WidgetConfiguration(
                'edit-ticket-type-dialog', 'Translatable#Edit Type', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-edit'
            ),
            KIXObjectType.TICKET_TYPE,
            ContextMode.EDIT_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-priority-dialog',
            new WidgetConfiguration(
                'new-ticket-priority-dialog', 'Translatable#New Priority', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-new-gear'
            ),
            KIXObjectType.TICKET_PRIORITY,
            ContextMode.CREATE_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-ticket-priority-dialog',
            new WidgetConfiguration(
                'edit-ticket-priority-dialog', 'Translatable#Edit Priority', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-edit'
            ),
            KIXObjectType.TICKET_PRIORITY,
            ContextMode.EDIT_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'new-ticket-state-dialog',
            new WidgetConfiguration(
                'new-ticket-state-dialog', 'Translatable#New State', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-new-gear'
            ),
            KIXObjectType.TICKET_STATE,
            ContextMode.CREATE_ADMIN
        ));

        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'edit-ticket-state-dialog',
            new WidgetConfiguration(
                'edit-ticket-state-dialog', 'Translatable#Edit State', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-edit'
            ),
            KIXObjectType.TICKET_STATE,
            ContextMode.EDIT_ADMIN
        ));
    }
}

module.exports = Component;
