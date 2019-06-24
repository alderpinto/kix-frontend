import { IConfigurationExtension } from '../../core/extensions';
import {
    ConfiguredWidget, WidgetConfiguration, WidgetSize, KIXObjectPropertyFilter, TableFilterCriteria,
    TicketProperty, FilterCriteria, FilterDataType, FilterType, FormField, KIXObjectType, Form,
    FormContext,
    ContextConfiguration,
    CRUD
} from '../../core/model';
import { TicketContext, TicketChartConfiguration } from '../../core/browser/ticket';
import {
    ToggleOptions, TableHeaderHeight, TableRowHeight, TableConfiguration, SearchOperator, SearchProperty
} from '../../core/browser';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class TicketModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const queueExplorer =
            new ConfiguredWidget(
                '20180813-ticket-queue-explorer', new WidgetConfiguration(
                    'ticket-queue-explorer', 'Translatable#Queues', [], {},
                    false, false, WidgetSize.SMALL, null
                ),
                [
                    new UIComponentPermission('tickets', [CRUD.READ]),
                    new UIComponentPermission('queues', [CRUD.READ])
                ]
            );

        const explorer = ['20180813-ticket-queue-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [queueExplorer];

        // sidebars
        const notesSidebar =
            new ConfiguredWidget('20180814-ticket-notes', new WidgetConfiguration(
                'notes-widget', 'Translatable#Notes', [], {},
                false, false, WidgetSize.BOTH, 'kix-icon-note', false)
            );

        const sidebars = ['20180814-ticket-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];


        const predefinedTicketFilter = [
            new KIXObjectPropertyFilter('Translatable#Owner', [
                new TableFilterCriteria(TicketProperty.OWNER_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER)
            ]),
            new KIXObjectPropertyFilter('Translatable#Watched Tickets', [
                new TableFilterCriteria(
                    TicketProperty.WATCHERS, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER, true
                )
            ]),
            new KIXObjectPropertyFilter('Translatable#Escalated Tickets', [
                new TableFilterCriteria(TicketProperty.ESCALATION_TIME, SearchOperator.LESS_THAN, 0)
            ]),
            new KIXObjectPropertyFilter('Translatable#Unlocked Tickets', [
                new TableFilterCriteria(TicketProperty.LOCK_ID, SearchOperator.EQUALS, 1)
            ]),
            new KIXObjectPropertyFilter('Translatable#Locked Tickets', [
                new TableFilterCriteria(TicketProperty.LOCK_ID, SearchOperator.EQUALS, 2)
            ]),
            new KIXObjectPropertyFilter('Translatable#Responsible Tickets', [
                new TableFilterCriteria(
                    TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER
                )
            ]),

        ];

        // content

        const chartConfig1 = new TicketChartConfiguration(TicketProperty.PRIORITY_ID, {
            type: 'bar',
            data: {
                labels: ["1 very low", "2 low", "3 normal", "4 high", "5 very high"],
                datasets: [{
                    data: [0, 3, 15, 25, 4],
                }]
            },
            options: {
                legend: {
                    display: false
                }
            }
        });
        const chart1 = new ConfiguredWidget('20180814-1-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Translatable#Overview Ticket Priorities', [], chartConfig1,
            false, true, WidgetSize.SMALL, null, true),
            [new UIComponentPermission('tickets', [CRUD.READ])]
        );

        const chartConfig2 = new TicketChartConfiguration(TicketProperty.STATE_ID, {
            type: 'pie',
            data: {
                labels: ["new", "open", "pending", "escalated"],
                datasets: [{
                    label: "Translatable#Ticket States",
                    data: [20, 50, 32, 8],
                    fill: true,
                    backgroundColor: [
                        "rgba(255, 0, 0, 0.8)",
                        "rgba(255, 0, 0, 0.6)",
                        "rgba(255, 0, 0, 0.4)",
                        "rgba(255, 0, 0, 0.2)",
                        "rgba(0, 0, 255, 0.8)",
                        "rgba(0, 0, 255, 0.6)",
                        "rgba(0, 0, 255, 0.4)",
                        "rgba(0, 0, 255, 0.2)",
                        "rgba(0, 255, 0, 0.8)",
                        "rgba(0, 255, 0, 0.6)",
                        "rgba(0, 255, 0, 0.4)"
                    ]
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        boxWidth: 10,
                        padding: 2,
                        fontSize: 10
                    }
                }
            }
        });
        const chart2 = new ConfiguredWidget('20180814-2-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Translatable#Overview Ticket States', [], chartConfig2,
            false, true, WidgetSize.SMALL, null, true),
            [new UIComponentPermission('tickets', [CRUD.READ])]
        );

        const chartConfig3 = new TicketChartConfiguration(TicketProperty.CREATED, {
            type: 'line',
            data: {
                labels: ["1", "2", "3", "4", "5", "6", "7"],
                datasets: [{
                    data: [5, 25, 12, 3, 30, 16, 24],
                    backgroundColor: [
                        'rgba(255, 0, 0, 0.5)'
                    ]
                }]
            },
            options: {
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1
                        }
                    }]
                }
            }
        } as any);
        const chart3 = new ConfiguredWidget('20180814-3-ticket-chart-widget', new WidgetConfiguration(
            'ticket-chart-widget', 'Translatable#New Tickets (recent 7 days)', [], chartConfig3,
            false, true, WidgetSize.SMALL, null, true),
            [new UIComponentPermission('tickets', [CRUD.READ])]
        );

        const ticketListWidget =
            new ConfiguredWidget('20180814-ticket-list-widget',
                new WidgetConfiguration(
                    'table-widget', 'Translatable#Overview Tickets', [
                        'ticket-create-action', 'bulk-action', 'csv-export-action', 'ticket-search-action'
                    ],
                    {
                        objectType: KIXObjectType.TICKET,
                        tableConfiguration: new TableConfiguration(KIXObjectType.TICKET,
                            1000, 25, null, [new FilterCriteria(
                                'StateType', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'Open'
                            )],
                            true, true,
                            new ToggleOptions('ticket-article-details', 'article', [], true),
                            null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                        )
                    },
                    false, false, WidgetSize.LARGE, 'kix-icon-ticket', true, predefinedTicketFilter
                ),
                [new UIComponentPermission('tickets', [CRUD.READ])]
            );

        const content = [
            '20180814-1-ticket-chart-widget', '20180814-2-ticket-chart-widget',
            '20180814-3-ticket-chart-widget', '20180814-ticket-list-widget'
        ];
        const contentWidgets = [chart1, chart2, chart3, ticketListWidget];

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            explorer, explorerWidgets,
            [], [],
            [], [],
            content, contentWidgets
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // tslint:disable:max-line-length
        const formIdLinkWithTicket = 'link-ticket-search-form';
        const existingFormLinkWithTicket = ConfigurationService.getInstance().getModuleConfiguration(formIdLinkWithTicket, null);
        if (!existingFormLinkWithTicket) {

            const fields: FormField[] = [];
            fields.push(new FormField('Translatable#Full Text', SearchProperty.FULLTEXT, null, false, 'Translatable#Searchable Ticket attributes: Ticketnumber, Subject, Article content, From, To, CC'));
            fields.push(new FormField('Translatable#Ticket Number', TicketProperty.TICKET_NUMBER, null, false, 'Translatable#Insert the ticket number or a part of the number (min. 1 character).'));
            fields.push(new FormField('Translatable#Title', TicketProperty.TITLE, null, false, 'Translatable#Insert the complete ticket title or a part of the title.'));
            fields.push(new FormField('Translatable#Type', TicketProperty.TYPE_ID, 'ticket-input-type', false, 'Translatable#Search for tickets with selected type.'));
            fields.push(new FormField('Translatable#Queue', TicketProperty.QUEUE_ID, 'ticket-input-queue', false, 'Translatable#Search for tickets with selected queue.'));
            fields.push(new FormField<number>(
                'Translatable#Priority', TicketProperty.PRIORITY_ID, 'ticket-input-priority', false, 'Translatable#Search for tickets with selected priority.')
            );
            fields.push(new FormField<number>(
                'Translatable#State', TicketProperty.STATE_ID, 'ticket-input-state', false, 'Translatable#Search for tickets with selected state.')
            );
            fields.push(new FormField('Translatable#Service', TicketProperty.SERVICE_ID, 'ticket-input-service', false, 'Translatable#Search for tickets with the selected service.'));
            fields.push(new FormField('Translatable#SLA', TicketProperty.SLA_ID, 'ticket-input-sla', false, 'Translatable#Search for tickets with selected SLA.'));

            const attributeGroup = new FormGroup('Translatable#Ticket Attributes', fields);

            const form = new Form(
                formIdLinkWithTicket, 'Translatable#Link to ticket', [attributeGroup],
                KIXObjectType.TICKET, false, FormContext.LINK, null, true
            );
            await ConfigurationService.getInstance().saveModuleConfiguration(form.id, null, form);
        }
        ConfigurationService.getInstance().registerForm(
            [FormContext.LINK], KIXObjectType.TICKET, formIdLinkWithTicket
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketModuleFactoryExtension();
};
