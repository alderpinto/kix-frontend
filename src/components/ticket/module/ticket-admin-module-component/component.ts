import {
    AbstractMarkoComponent, ContextService, DialogService, ActionFactory, ServiceRegistry
} from "../../../../core/browser";
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, ConfiguredDialogWidget,
    WidgetConfiguration, WidgetSize, CRUD
} from "../../../../core/model";
import { AuthenticationSocketClient } from "../../../../core/browser/application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../../core/model/UIComponentPermission";
import {
    TicketTypeCreateAction, TicketTypeTableDeleteAction, TicketTypeEditAction, TicketTypeDetailsContext,
    NewTicketTypeDialogContext, EditTicketTypeDialogContext, TicketStateCreateAction, TicketStateTableDeleteAction,
    TicketStateEditAction, TicketStateDetailsContext, NewTicketStateDialogContext, EditTicketStateDialogContext,
    TicketPriorityCreateAction, TicketPriorityTableDeleteAction, TicketPriorityEditAction, TicketPriorityDetailsContext,
    NewTicketPriorityDialogContext, EditTicketPriorityDialogContext, TicketQueueCreateAction, NewQueueDialogContext,
    QueueDetailsContext, TicketQueueEditAction, TicketStateFormService, TicketPriorityFormService, TicketTypeFormService
} from "../../../../core/browser/ticket";

class Component extends AbstractMarkoComponent {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        ServiceRegistry.registerServiceInstance(TicketTypeFormService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketPriorityFormService.getInstance());
        ServiceRegistry.registerServiceInstance(TicketStateFormService.getInstance());

        this.registerTicketTypeAdmin();
        this.registerTicketStatesAdmin();
        this.registerTicketPrioritiesAdmin();
        this.registerTicketQueuesAdmin();
    }

    private async registerTicketTypeAdmin(): Promise<void> {

        if (await this.checkPermission('system/ticket/types', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-type-create', TicketTypeCreateAction);

            const newTicketTypeContext = new ContextDescriptor(
                NewTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-ticket-type-dialog', ['tickettypes'], NewTicketTypeDialogContext
            );
            ContextService.getInstance().registerContext(newTicketTypeContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-ticket-type-dialog',
                new WidgetConfiguration(
                    'new-ticket-type-dialog', 'Translatable#New Type', [], {},
                    false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.TICKET_TYPE,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/ticket/types/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-type-edit', TicketTypeEditAction);
            const editTicketTypeContext = new ContextDescriptor(
                EditTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-ticket-type-dialog', ['tickettypes'], EditTicketTypeDialogContext
            );
            ContextService.getInstance().registerContext(editTicketTypeContext);



            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-ticket-type-dialog',
                new WidgetConfiguration(
                    'edit-ticket-type-dialog', 'Translatable#Edit Type', [], {},
                    false, false, 'kix-icon-edit'
                ),
                KIXObjectType.TICKET_TYPE,
                ContextMode.EDIT_ADMIN
            ));
        }

        if (await this.checkPermission('system/ticket/types/*', CRUD.DELETE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-type-table-delete', TicketTypeTableDeleteAction);
        }

        const ticketTypeDetailsContextDescriptor = new ContextDescriptor(
            TicketTypeDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_TYPE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['tickettypes'], TicketTypeDetailsContext
        );
        ContextService.getInstance().registerContext(ticketTypeDetailsContextDescriptor);
    }

    private async registerTicketStatesAdmin(): Promise<void> {

        if (await this.checkPermission('system/ticket/states', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-state-create', TicketStateCreateAction);

            const newTicketStateContext = new ContextDescriptor(
                NewTicketStateDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-ticket-state-dialog', ['ticketstates'], NewTicketStateDialogContext
            );
            ContextService.getInstance().registerContext(newTicketStateContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-ticket-state-dialog',
                new WidgetConfiguration(
                    'new-ticket-state-dialog', 'Translatable#New State', [], {},
                    false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.TICKET_STATE,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/ticket/states/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-state-edit', TicketStateEditAction);

            const editTicketStateContext = new ContextDescriptor(
                EditTicketStateDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-ticket-state-dialog', ['ticketstates'], EditTicketStateDialogContext
            );
            ContextService.getInstance().registerContext(editTicketStateContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-ticket-state-dialog',
                new WidgetConfiguration(
                    'edit-ticket-state-dialog', 'Translatable#Edit State', [], {},
                    false, false, 'kix-icon-edit'
                ),
                KIXObjectType.TICKET_STATE,
                ContextMode.EDIT_ADMIN
            ));
        }

        if (await this.checkPermission('system/ticket/states/*', CRUD.DELETE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-state-table-delete', TicketStateTableDeleteAction);
        }

        const ticketStateDetailsContextDescriptor = new ContextDescriptor(
            TicketStateDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_STATE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['ticketstates'], TicketStateDetailsContext
        );
        ContextService.getInstance().registerContext(ticketStateDetailsContextDescriptor);
    }

    private async registerTicketPrioritiesAdmin(): Promise<void> {

        if (await this.checkPermission('system/ticket/priorities', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-priority-create', TicketPriorityCreateAction);

            const newTicketPriorityContext = new ContextDescriptor(
                NewTicketPriorityDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-ticket-priority-dialog', ['priorities'], NewTicketPriorityDialogContext
            );
            ContextService.getInstance().registerContext(newTicketPriorityContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-ticket-priority-dialog',
                new WidgetConfiguration(
                    'new-ticket-priority-dialog', 'Translatable#New Priority', [], {},
                    false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.TICKET_PRIORITY,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/ticket/priorities/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-priority-edit', TicketPriorityEditAction);

            const editTicketPriorityContext = new ContextDescriptor(
                EditTicketTypeDialogContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-ticket-priority-dialog', ['priorities'], EditTicketPriorityDialogContext
            );
            ContextService.getInstance().registerContext(editTicketPriorityContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-ticket-priority-dialog',
                new WidgetConfiguration(
                    'edit-ticket-priority-dialog', 'Translatable#Edit Priority', [], {},
                    false, false, 'kix-icon-edit'
                ),
                KIXObjectType.TICKET_PRIORITY,
                ContextMode.EDIT_ADMIN
            ));
        }

        if (await this.checkPermission('system/ticket/priorities/*', CRUD.DELETE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-priority-table-delete',
                TicketPriorityTableDeleteAction
            );
        }

        const ticketPriorityDetailsContextDescriptor = new ContextDescriptor(
            TicketPriorityDetailsContext.CONTEXT_ID, [KIXObjectType.TICKET_PRIORITY],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['priorities'], TicketPriorityDetailsContext
        );
        ContextService.getInstance().registerContext(ticketPriorityDetailsContextDescriptor);
    }

    private async registerTicketQueuesAdmin(): Promise<void> {

        if (await this.checkPermission('system/ticket/queues', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-queue-create', TicketQueueCreateAction);

            const newQueueContext = new ContextDescriptor(
                NewQueueDialogContext.CONTEXT_ID, [KIXObjectType.QUEUE],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-ticket-queue-dialog', ['queues'], NewQueueDialogContext
            );
            ContextService.getInstance().registerContext(newQueueContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-ticket-queue-dialog',
                new WidgetConfiguration(
                    'new-ticket-queue-dialog', 'Translatable#New Queue', [], {},
                    false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.QUEUE,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/ticket/queues/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('ticket-admin-queue-edit', TicketQueueEditAction);
        }

        const ticketQueueDetailsContextDescriptor = new ContextDescriptor(
            QueueDetailsContext.CONTEXT_ID, [KIXObjectType.QUEUE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['queues'], QueueDetailsContext
        );
        ContextService.getInstance().registerContext(ticketQueueDetailsContextDescriptor);
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }
}

module.exports = Component;