import { Ticket, KIXObjectType, ContextMode } from "@kix/core/dist/model";
import { ComponentState } from './ComponentState';
import {
    ArticleTableContentLayer,
    ArticleTableFilterLayer,
    ArticleTableLabelLayer,
    ArticleTableClickListener,
    ArticleTableToggleListener,
    ArticleTableToggleLayer
} from "@kix/core/dist/browser/ticket";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    StandardTable, ITableConfigurationListener, TableColumn,
    TableSortLayer, ActionFactory, TableListenerConfiguration, TableLayerConfiguration, WidgetService
} from "@kix/core/dist/browser";
import { IdService } from "@kix/core/dist/browser/IdService";
import { IEventListener, EventService } from "@kix/core/dist/browser/event";

export class Component implements IEventListener {

    private state: ComponentState;
    public eventSubscriberId: string = 'ArticleList';

    public onCreate(input: any): void {
        this.state = new ComponentState(Number(input.ticketId), 'article-list');
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.setTicket();
        this.getArticles();
        this.setActions();
        this.setArticleTableConfiguration();

        EventService.getInstance().subscribe('ShowArticleInTicketDetails', this);
        EventService.getInstance().subscribe('ArticleTableRowToggled', this);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe('ShowArticleInTicketDetails', this);
        EventService.getInstance().unsubscribe('ArticleTableRowToggled', this);
    }

    public async setTicket(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context.objectId) {
            const ticketsResponse = await ContextService.getInstance().loadObjects<Ticket>(
                KIXObjectType.TICKET, [context.objectId], ContextMode.DETAILS
            );
            this.state.ticket = ticketsResponse && ticketsResponse.length ? ticketsResponse[0] : null;
        }
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.generalArticleActions = ActionFactory.getInstance()
                .generateActions(this.state.widgetConfiguration.settings.generalActions, true, [this.state.ticket]);

            WidgetService.getInstance().registerActions(this.state.instanceId, this.state.generalArticleActions);
        }
    }

    private setArticleTableConfiguration(): void {
        if (this.state.widgetConfiguration) {

            const tableConfiguration = this.state.widgetConfiguration.settings.tableConfiguration;
            tableConfiguration.displayLimit = this.state.articles.length;

            const layerConfiguration = new TableLayerConfiguration(
                new ArticleTableContentLayer(this.state.ticket),
                new ArticleTableLabelLayer(),
                [new ArticleTableFilterLayer()],
                [new TableSortLayer()],
                new ArticleTableToggleLayer(new ArticleTableToggleListener(), true)
            );

            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(
                new ArticleTableClickListener(), null, configurationListener
            );

            this.state.standardTable = new StandardTable(
                IdService.generateDateBasedId(),
                tableConfiguration, layerConfiguration, listenerConfiguration
            );
        }
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableConfiguration.tableColumns
                .findIndex((tc) => tc.columnId === column.id);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableConfiguration.tableColumns[index].size = column.size;
            ContextService.getInstance().saveWidgetConfiguration(
                this.state.instanceId, this.state.widgetConfiguration
            );
        }
    }

    private getArticles(): void {
        if (this.state.ticket) {
            this.state.articles = this.state.ticket.Articles;
        }
    }

    private getAttachmentsCount(): number {
        let count = 0;

        if (this.state.articles) {
            this.state.articles.forEach((article) => {
                if (article.Attachments) {
                    count += article.Attachments.length;
                }
            });
        }

        return count;
    }

    private attachmentsClicked(): void {
        alert('Alle Anlagen ...');
    }

    private filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        this.state.standardTable.setFilterSettings(filterValue);
    }

    private getTitle(): string {
        return 'Artikelübersicht (' + (this.state.articles ? this.state.articles.length : '0') + ')';
    }

    public eventPublished(data: any, eventId: string): void {
        if (eventId === 'ArticleTableRowToggled') {
            this.state.standardTable.loadRows();
        } else {
            EventService.getInstance().publish(this.state.eventSubscriberWidgetPrefix + 'SetMinimizedToFalse');
            setTimeout(() => {
                EventService.getInstance().publish('ScrollToArticleInArticleTable', data);
            }, 500);
        }
    }
}

module.exports = Component;
