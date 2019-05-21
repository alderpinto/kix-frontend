import { ContextService } from '../../../core/browser/context';
import { ComponentsService, TabContainerEvent, TabContainerEventData } from '../../../core/browser/components';
import { WidgetType, ConfiguredWidget, ObjectIcon } from '../../../core/model';
import { ComponentState } from './ComponentState';
import { WidgetService, ActionFactory, IdService } from '../../../core/browser';
import { IEventSubscriber, EventService } from '../../../core/browser/event';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class TabLaneComponent implements IEventSubscriber {

    public eventSubscriberId: string = IdService.generateDateBasedId('tab-container');

    private state: ComponentState;

    private initialTabId: string;
    private tabIcons: Map<string, string | ObjectIcon>;
    private tabTitles: Map<string, string>;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.tabWidgets);
        this.tabTitles = new Map();
        this.tabIcons = new Map();

        this.state.tabWidgets = input.tabWidgets ? input.tabWidgets : [];
        this.initialTabId = input.tabId;
        this.state.minimizable = typeof input.minimizable !== 'undefined' ? input.minimizable : true;
        this.state.contextType = input.contextType;
        this.state.showSidebar = typeof input.showSidebar !== 'undefined' ? input.showSidebar : true;

        WidgetService.getInstance().setWidgetType("tab-widget", WidgetType.LANE);
        this.state.tabWidgets.forEach(
            (tab) => WidgetService.getInstance().setWidgetType(tab.instanceId, WidgetType.LANE_TAB)
        );
        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_TITLE, this);
        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_ICON, this);
        EventService.getInstance().subscribe(TabContainerEvent.CHANGE_TAB, this);
    }

    public async onMount(): Promise<void> {
        if (this.state.tabWidgets.length) {

            this.state.translations = await TranslationService.createTranslationObject(
                this.state.tabWidgets.map((t) => t.configuration.title)
            );

            if (this.initialTabId) {
                await this.tabClicked(this.state.tabWidgets.find((tw) => tw.instanceId === this.initialTabId));
            }
            if (!this.state.activeTab) {
                await this.tabClicked(this.state.tabWidgets[0]);
            }
        }

        if (this.state.contextType) {
            this.setSidebars();
        }

        if (this.state.tabWidgets.length && this.state.activeTab && this.state.tabId) {
            const tab = this.state.tabWidgets.find((tw) => tw.instanceId === this.state.tabId);
            if (tab && tab.instanceId !== this.state.activeTab.instanceId) {
                this.state.activeTab = tab;
            }
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TabContainerEvent.CHANGE_TITLE, this);
        EventService.getInstance().unsubscribe(TabContainerEvent.CHANGE_ICON, this);
        EventService.getInstance().unsubscribe(TabContainerEvent.CHANGE_TAB, this);
    }

    public async tabClicked(tab: ConfiguredWidget): Promise<void> {
        this.state.activeTab = tab;
        this.state.activeTabTitle = this.state.activeTab ? this.state.activeTab.configuration.title : '';
        if (tab) {
            const context = await ContextService.getInstance().getActiveContext(this.state.contextType);
            if (context) {
                const object = await context.getObject(context.getDescriptor().kixObjectTypes[0]);

                this.state.contentActions = await ActionFactory.getInstance().generateActions(
                    tab.configuration.actions, [object]
                );
            }
        }
        (this as any).emit('tabChanged', tab);
    }

    public getWidgetTemplate(): any {
        return this.state.activeTab
            ? ComponentsService.getInstance().getComponentTemplate(this.state.activeTab.configuration.widgetId)
            : undefined;
    }

    public getLaneTabWidgetType(): number {
        return WidgetType.LANE_TAB;
    }

    private setSidebars(): void {
        if (this.state.showSidebar) {
            const context = ContextService.getInstance().getActiveContext(this.state.contextType);
            this.state.hasSidebars = context ? context.getSidebars().length > 0 : false;
        }
    }

    public isActiveTab(tabId: string): boolean {
        return this.state.activeTab && this.state.activeTab.instanceId === tabId;
    }

    public async eventPublished(data: TabContainerEventData, eventId: string): Promise<void> {
        if (eventId === TabContainerEvent.CHANGE_TITLE) {
            const tab = this.state.tabWidgets.find((t) => t.instanceId === data.tabId);
            if (tab) {
                const newTitle = await TranslationService.translate(data.title);
                this.tabTitles.set(tab.instanceId, newTitle);
                (this as any).setStateDirty('tabWidgets');
            }
        }
        if (eventId === TabContainerEvent.CHANGE_ICON) {
            const tab = this.state.tabWidgets.find((t) => t.instanceId === data.tabId);
            if (tab) {
                this.tabIcons.set(tab.instanceId, data.icon);
                (this as any).setStateDirty('tabWidgets');
            }
        }
        if (eventId === TabContainerEvent.CHANGE_TAB) {
            const tab = this.state.tabWidgets.find((t) => t.instanceId === data.tabId);
            if (tab) {
                this.tabClicked(tab);
            }
        }
    }

    public getTitle(tab: ConfiguredWidget): string {
        return this.tabTitles.has(tab.instanceId) ?
            this.tabTitles.get(tab.instanceId) : this.state.translations[tab.configuration.title];
    }

    public getIcon(tab: ConfiguredWidget): string | ObjectIcon {
        return this.tabIcons.has(tab.instanceId) ? this.tabIcons.get(tab.instanceId) : tab.configuration.icon;
    }
}

module.exports = TabLaneComponent;
