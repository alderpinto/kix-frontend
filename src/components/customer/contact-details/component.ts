import { ComponentState } from "./ComponentState";
import { KIXObjectType, WidgetType, Contact } from "../../../core/model";
import {
    ContextService, ActionFactory, IdService, WidgetService
} from "../../../core/browser";
import { ContactDetailsContext } from "../../../core/browser/contact";
import { ComponentsService } from "../../../core/browser/components";
import { TranslationService } from "../../../core/browser/i18n/TranslationService";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }
    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Contact Information"
        ]);

        const context = (ContextService.getInstance().getActiveContext() as ContactDetailsContext);
        context.registerListener('contact-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (contactId: string, contact: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT) {
                    this.initWidget(context, contact);
                }
            }
        });
        await this.initWidget(context);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async initWidget(context: ContactDetailsContext, contact?: Contact): Promise<void> {
        this.state.error = null;
        this.state.contact = contact ? contact : await context.getObject<Contact>().catch((error) => null);

        if (!this.state.contact) {
            this.state.error = `Kein Ansprechpartner mit ID ${context.getObjectId()} verfügbar.`;
        }

        this.state.configuration = context.getConfiguration();
        this.state.lanes = context.getLanes();
        this.state.tabWidgets = context.getLaneTabs();
        await this.prepareActions();
        await this.prepareTitle();
    }

    private async prepareActions(): Promise<void> {
        const config = this.state.configuration;
        if (config && this.state.contact) {
            const actions = await ActionFactory.getInstance().generateActions(
                config.generalActions, [this.state.contact]
            );
            WidgetService.getInstance().registerActions(this.state.instanceId, actions);

            this.state.contactActions = await ActionFactory.getInstance().generateActions(
                config.contactActions, [this.state.contact]
            );
        }
    }

    public async prepareTitle(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.title = await context.getDisplayText();

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
