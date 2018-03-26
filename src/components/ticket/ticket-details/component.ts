import {
    TicketService, TicketNotification, TicketDetailsContext
} from '@kix/core/dist/browser/ticket/';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import {
    BreadcrumbDetails, TicketDetailsDashboardConfiguration, Ticket, Context, WidgetType, DashboardConfiguration
} from '@kix/core/dist/model';
import { TicketDetailsComponentState } from './TicketDetailsComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context/';
import { ActionFactory } from '@kix/core/dist/browser';

export class TicketDetailsComponent {

    private state: TicketDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketDetailsComponentState();
    }

    public onInput(input: any): void {
        const newTicketId = Number(input.ticketId);
        if (newTicketId !== this.state.ticketId) {
            this.state.ticketId = newTicketId;
            this.loadTicket();
        }
    }

    public onMount(): void {
        this.setBreadcrumbDetails();

        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));

        const contextURL = 'tickets/' + this.state.ticketId;
        const context = new TicketDetailsContext(this.state.ticketId);
        ContextService.getInstance().provideContext(context, true);
    }

    private async loadTicket(): Promise<void> {
        if (!this.state.loading) {
            this.state.loading = true;
            const ticket = await TicketService.getInstance().loadTicket(this.state.ticketId);
            this.state.ticket = ticket;
            this.setActions();
            this.setBreadcrumbDetails();
            this.setTicketHookInfo();
            this.state.loading = false;
        }
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (type === ContextNotification.CONTEXT_CONFIGURATION_CHANGED && id === TicketDetailsContext.CONTEXT_ID) {
            this.setConfiguration();
        }
    }

    private setConfiguration(): void {
        const context = ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
        this.state.ticketDeatilsConfiguration = (context.dashboardConfiguration as TicketDetailsDashboardConfiguration);

        if (this.state.ticketDeatilsConfiguration) {
            this.state.lanes = context ? context.getWidgets(WidgetType.LANE) : [];
            this.state.tabs = context ? context.getWidgets(WidgetType.LANE_TAB) : [];
            this.setActions();
            if (!this.state.activeTabId && this.state.tabs.length) {
                this.state.activeTabId = this.state.tabs[0].instanceId;
            }
        }
    }

    private setActions(): void {
        const config = this.state.ticketDeatilsConfiguration;
        if (config && this.state.ticket) {
            this.state.generalActions =
                ActionFactory.getInstance().generateActions(config.generalActions, true, this.state.ticket);
            this.state.ticketActions =
                ActionFactory.getInstance().generateActions(config.ticketActions, true, this.state.ticket);
        }
    }

    private setTicketHookInfo(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.ticketHook = objectData.ticketHook;
            this.state.ticketHookDivider = objectData.ticketHookDivider;
        }
    }

    private setBreadcrumbDetails(): void {
        const value = this.state.ticket ? this.state.ticket.TicketNumber : this.state.ticketId;

        const breadcrumbDetails = new BreadcrumbDetails(
            'tickets', TicketDetailsContext.CONTEXT_ID, this.state.ticketId.toString(),
            'Ticket-Dashboard', '#' + value, null
        );

        ComponentRouterService.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getContext();
        return context ? context.getWidgetTemplate(instanceId) : undefined;
    }

    private tabClicked(tabId: string): void {
        this.state.activeTabId = tabId;
    }

    private getTitle(): string {
        const titlePrefix = this.state.ticketHook + this.state.ticketHookDivider + this.state.ticket.TicketNumber;
        return titlePrefix + " - " + this.state.ticket.Title;
    }

}

module.exports = TicketDetailsComponent;
