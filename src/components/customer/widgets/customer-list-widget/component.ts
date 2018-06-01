import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, ITableConfigurationListener, TableColumn,
    TableRowHeight, StandardTable, IdService, TableSortLayer, TableFilterLayer
} from "@kix/core/dist/browser";
import { WidgetConfiguration, Customer } from "@kix/core/dist/model";
import {
    CustomerTableContentLayer, CustomerTableLabelLayer, CustomerDetailsContext
} from "@kix/core/dist/browser/customer";
import { ComponentRouterService } from "@kix/core/dist/browser/router";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.state.actions = ActionFactory.getInstance().generateActions(
            this.state.widgetConfiguration.actions, true, null
        );

        this.setTableConfiguration();
    }

    private setTableConfiguration(): void {
        if (this.state.widgetConfiguration) {

            const configurationListener: ITableConfigurationListener<Customer> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            this.state.standardTable = new StandardTable(
                IdService.generateDateBasedId(),
                new CustomerTableContentLayer(),
                new CustomerTableLabelLayer(),
                [new TableFilterLayer()],
                [new TableSortLayer()],
                null, null, null,
                this.state.widgetConfiguration.settings.tableColumns || [],
                null,
                {
                    rowClicked: (customer: Customer, columnId: string): void => {
                        ComponentRouterService.getInstance().navigate(
                            'base-router',
                            CustomerDetailsContext.CONTEXT_ID,
                            { customerId: customer.CustomerID },
                            customer.CustomerID
                        );
                    }
                },
                configurationListener,
                this.state.widgetConfiguration.settings.displayLimit,
                false,
                TableRowHeight.SMALL,
                false
            );
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

    private filter(filterValue?: string): void {
        if (filterValue !== null && filterValue !== "") {
            this.state.standardTable.setFilterSettings(filterValue);
        } else {
            this.state.standardTable.resetFilter();
        }
    }

}

module.exports = Component;
