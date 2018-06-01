import { ComponentState } from "./ComponentState";
import {
    ContextService, StandardTable, TableFilterLayer,
    TableSortLayer, TableRowHeight, IdService, TableColumn,
    ITableConfigurationListener, ITableClickListener, DialogService
} from "@kix/core/dist/browser";
import { KIXObjectType, Customer, Contact } from "@kix/core/dist/model";
import { ContactService, ContactTableContentLayer, ContactTableLabelLayer } from "@kix/core/dist/browser/contact";
import {
    CustomerTableContentLayer, CustomerTableLabelLayer, CustomerDetailsContext
} from "@kix/core/dist/browser/customer";
import { ComponentRouterService } from "@kix/core/dist/browser/router";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;

        const context = ContextService.getInstance().getContext();
        context.registerListener({
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectChanged: (objectId: string | number, object: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT && (!this.state.contact || !this.state.contact.equals(object))) {
                    this.state.contact = object;
                    this.setTable();
                }
            }
        });

        this.state.contact = (context.getObject(context.objectId) as Contact);
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.setTable();
        if (this.state.widgetConfiguration) {
            this.state.title = this.state.widgetConfiguration.title;
            if (this.state.contact && this.state.contact.UserCustomerIDs.length > 0) {
                this.state.title += ' (' + this.state.contact.UserCustomerIDs.length + ')';
            }
        }
    }

    private setTable(): void {
        if (this.state.contact && this.state.widgetConfiguration) {
            const configurationListener: ITableConfigurationListener<Customer> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            const clickListener: ITableClickListener<Customer> = {
                rowClicked: this.tableRowClicked.bind(this)
            };

            this.state.customerTable = new StandardTable(
                'assigned-customers-' + IdService.generateDateBasedId(),
                new CustomerTableContentLayer(this.state.contact.UserCustomerIDs),
                new CustomerTableLabelLayer(),
                [new TableFilterLayer()],
                [new TableSortLayer()],
                null, null, null,
                this.state.widgetConfiguration.settings.tableColumns || [],
                null,
                clickListener,
                configurationListener,
                this.state.widgetConfiguration.settings.displayLimit,
                false,
                TableRowHeight.SMALL);
        }
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableColumns.findIndex((tc) => tc.columnId === column.id);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableColumns[index].size = column.size;
            ContextService.getInstance().saveWidgetConfiguration(
                this.state.instanceId, this.state.widgetConfiguration
            );
        }
    }

    private tableRowClicked(customer: Customer, columnId: string): void {
        if (columnId === 'customer-new-ticket') {
            DialogService.getInstance().openMainDialog('new-customer-dialog');
        } else {
            ComponentRouterService.getInstance().navigate(
                'base-router',
                CustomerDetailsContext.CONTEXT_ID,
                { customerId: customer.CustomerID },
                customer.CustomerID
            );
        }
    }

    private filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        if (filterValue === '') {
            this.state.customerTable.resetFilter();
        } else {
            this.state.customerTable.setFilterSettings(filterValue);
        }
    }
}

module.exports = Component;
