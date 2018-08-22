import { ComponentState } from "./ComponentState";
import { KIXObjectType, WidgetType, Customer } from "@kix/core/dist/model";
import {
    ContextService, ActionFactory, IdService, WidgetService
} from "@kix/core/dist/browser";
import { CustomerDetailsContext } from "@kix/core/dist/browser/customer";
import { ComponentsService } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (ContextService.getInstance().getActiveContext() as CustomerDetailsContext);
        context.registerListener('contact-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (customerId: string, customer: Customer, type: KIXObjectType) => {
                if (type === KIXObjectType.CUSTOMER) {
                    this.initWidget(context, customer);
                }
            }
        });
        await this.initWidget(context);
    }

    private async initWidget(context: CustomerDetailsContext, customer?: Customer): Promise<void> {
        this.state.loading = true;
        this.state.customer = customer ? customer : await context.getObject<Customer>();
        this.state.configuration = context.getConfiguration();
        this.state.lanes = context.getLanes();
        this.state.tabWidgets = context.getLaneTabs();
        this.setActions();

        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    private setActions(): void {
        const config = this.state.configuration;
        if (config && this.state.customer) {
            const actions = ActionFactory.getInstance().generateActions(
                config.generalActions, true, [this.state.customer]
            );
            WidgetService.getInstance().registerActions(this.state.instanceId, actions);
        }
    }

    public getCustomerActions(): string[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.customerId) {
            actions = ActionFactory.getInstance().generateActions(config.customerActions, true, [this.state.customer]);
        }
        return actions;
    }

    public getTitle(): string {
        const context = ContextService.getInstance().getActiveContext();
        return context.getDisplayText();

    }

    public getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }

}

module.exports = Component;
