import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { TicketData, TicketService, TicketNotification } from '@kix/core/dist/browser/ticket/';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';
import { TicketDetails, Ticket, Context, WidgetType, DashboardConfiguration } from '@kix/core/dist/model';
import { TicketDetailsComponentState } from './TicketDetailsComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context/';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';

export class TicketDetailsComponent {

    private state: any;

    private static MODULE_ID: string = 'ticket-details';

    public onCreate(input: any): void {
        this.state = new TicketDetailsComponentState();
    }

    public onInput(input: any): void {
        this.state.ticketId = input.ticketId;
        TicketService.getInstance().loadTicketDetails(this.state.ticketId);
    }

    public onMount(): void {
        this.setBreadcrumbDetails();

        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        TicketService.getInstance().addStateListener(this.ticketServiceNotified.bind(this));

        TicketService.getInstance().loadTicketDetails(this.state.ticketId);

        const context = new Context('ticket-details');
        ContextService.getInstance().provideContext(context, 'ticket-details', true);

        DashboardService.getInstance().loadDashboardConfiguration('ticket-details');
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED && id === TicketDetailsComponent.MODULE_ID) {
            const context = ContextService.getInstance().getContext(TicketDetailsComponent.MODULE_ID);

            this.state.lanes = context ? context.getWidgets(WidgetType.LANE) : [];
            this.state.tabs = context ? context.getWidgets(WidgetType.LANE_TAB) : [];

            if (!this.state.activeTabId && this.state.tabs.length) {
                this.state.activeTabId = this.state.tabs[0].instanceId;
            }
        }
    }

    public ticketServiceNotified(id: string, type: TicketNotification, ...args) {
        if (type === TicketNotification.TICKET_DETAILS_LOADED) {
            const ticketDetails: TicketDetails = args[0];
            if (ticketDetails.ticketId === this.state.ticketId && ticketDetails) {
                this.state.ticket = ticketDetails.ticket;
                this.state.articles = ticketDetails.articles;
                this.setBreadcrumbDetails();
            }
        }
    }

    private setBreadcrumbDetails(): void {
        const value = this.state.ticket ? this.state.ticket.TicketNumber : this.state.ticketId;

        const breadcrumbDetails = new BreadcrumbDetails(
            'tickets', TicketDetailsComponent.MODULE_ID, this.state.ticketId, 'Ticket-Dashboard', '#' + value, null
        );

        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        return context ? context.getWidgetTemplate(instanceId) : undefined;
    }

    private tabClicked(tabId: string): void {
        this.state.activeTabId = tabId;
    }

}

module.exports = TicketDetailsComponent;
