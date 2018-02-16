import { TicketListComponentState } from './model/TicketListComponentState';
import { DashboardService } from '@kix/core/dist/browser/dashboard/DashboardService';
import {
    TicketDetails, ContextFilter, Context, ObjectType, Ticket, TicketState, TicketProperty
} from '@kix/core/dist/model/';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import {
    TicketNotification,
    TicketService,
    TicketTableContentProvider,
    TicketTableLabelProvider,
    TicketTableSelectionListener,
    TicketTableClickListener,
    TicketTableConfigurationListener,
    TicketUtil
} from '@kix/core/dist/browser/ticket/';
import { StandardTableColumn, StandardTableConfiguration } from '@kix/core/dist/browser';

class TicketListWidgetComponent {

    public state: TicketListComponentState;

    protected store: any;

    private componentInitialized: boolean = false;

    public onCreate(input: any): void {
        this.state = new TicketListComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.setTableConfiguration();
    }

    private contextServiceNotified(requestId: string, type: ContextNotification, ...args) {
        if (type === ContextNotification.CONTEXT_FILTER_CHANGED) {
            const contextFilter: ContextFilter = args[0];
            if (contextFilter && contextFilter.objectType === ObjectType.QUEUE && contextFilter.objectValue) {
                this.state.contextFilter = contextFilter;
                this.filter();
            } else {
                this.state.contextFilter = null;
            }
        } else if (type === ContextNotification.CONTEXT_UPDATED) {
            const context = ContextService.getInstance().getContext();
            this.state.widgetConfiguration =
                context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
            this.setTableConfiguration();
        } else if (type === ContextNotification.OBJECT_LIST_UPDATED) {
            const tickets: Ticket[] = args[0];
            if (requestId === this.state.instanceId && tickets) {
                this.state.tickets = tickets;
                this.state.filteredTickets = tickets;
                this.filter();
            }
        }
    }

    private setTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            const labelProvider = new TicketTableLabelProvider();

            const contentProvider = new TicketTableContentProvider(
                this.state.instanceId,
                this.state.widgetConfiguration.settings.tableColumns,
                this.state.widgetConfiguration.settings.limit,
                this.state.widgetConfiguration.settings.displayLimit
            );

            const selectionListener = new TicketTableSelectionListener();
            const clickListener = new TicketTableClickListener();
            const configurationListener: TicketTableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            this.state.tableConfiguration = new StandardTableConfiguration(
                labelProvider, contentProvider, selectionListener, clickListener, configurationListener, true, true
            );
        }
    }

    private columnConfigurationChanged(column: StandardTableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableColumns.findIndex((tc) => tc.columnId === column.columnId);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableColumns[index] = column;
        } else {
            this.state.widgetConfiguration.settings.tableColumns.push(column);
        }

        DashboardService.getInstance().saveWidgetConfiguration(this.state.instanceId, this.state.widgetConfiguration);
    }

    private filterChanged(event): void {
        this.state.filterValue = event.target.value;
    }

    private filter(): void {
        let usedContextFilter = false;
        if (
            this.state.widgetConfiguration && this.state.widgetConfiguration.contextDependent &&
            this.state.contextFilter
        ) {
            this.state.filteredTickets =
                this.state.tickets.filter((t) => t.QueueID === this.state.contextFilter.objectValue);

            usedContextFilter = true;
        }


        if (this.state.filterValue !== null && this.state.filterValue !== "") {
            const searchValue = this.state.filterValue.toLocaleLowerCase();

            const tickets = usedContextFilter ? this.state.filteredTickets : this.state.tickets;

            this.state.filteredTickets = tickets.filter((ticket: Ticket) => {
                const foundTitle = ticket.Title.toLocaleLowerCase().indexOf(searchValue) !== -1;
                const foundTicketNumber = ticket.TicketNumber.toLocaleLowerCase().indexOf(searchValue) !== -1;
                return foundTitle || foundTicketNumber;
            });
        } else if (!usedContextFilter) {
            this.state.filteredTickets = this.state.tickets;
        }

        (this as any).setStateDirty('filteredTickets');
    }

}

module.exports = TicketListWidgetComponent;
