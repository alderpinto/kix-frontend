import { IModuleFactoryExtension } from '@kix/core/dist/extensions';
import { ConfiguredWidget, WidgetSize } from '@kix/core/dist/model';

export class DashboardModuleFactoryExtension implements IModuleFactoryExtension {

    public getTemplate(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/modules/dashboard/';
    }

    public getModuleId(): string {
        return "dashboard";
    }

    public getDefaultConfiguration(): any {

        // TODO: aus einer config auslesen, oder wirklich DashboardConfiguration zurückgeben
        const contentRows: string[][] = [
            [
                '20170920072542',
                '20170920084512',
                '20170920113214',
            ],
            ['20170920101621'],
            ['20170920093015']
        ];
        const SidebarRows: string[][] = [
            ['20170915101514'],
            ['20170915094112'],
            ['20170915085411']
        ];
        const contentConfiguredWidgets: ConfiguredWidget[] = [
            {
                instanceId: '20170920072542',
                configuration: {
                    widgetId: 'chart-widget',
                    title: 'Chart',
                    actions: [],
                    settings: {
                        chartType: 'bar'
                    },
                    show: true,
                    size: WidgetSize.SMALL
                }
            },
            {
                instanceId: '20170920084512',
                configuration: {
                    widgetId: 'chart-widget',
                    title: 'Chart 2',
                    actions: [],
                    settings: {
                        chartType: 'pie'
                    },
                    show: true,
                    size: WidgetSize.SMALL
                }
            },
            {
                instanceId: '20170920113214',
                configuration: {
                    widgetId: 'search-templates-widget',
                    title: 'Suchvorlagen',
                    actions: [],
                    settings: {},
                    show: true,
                    size: WidgetSize.SMALL
                },
            },
            {
                instanceId: '20170920101621',
                configuration: {
                    widgetId: 'ticket-list-widget',
                    title: 'Ticket-Liste',
                    actions: [],
                    settings: {
                        limit: 10,
                        showTotalCount: true,
                        properties: [
                            'TicketNumber',
                            'PriorityID',
                            'StateID',
                            'TypeID',
                            'Title',
                            'Created',
                            'Age'
                        ]
                    },
                    show: true,
                    size: WidgetSize.LARGE
                },
            },
            {
                instanceId: '20170920093015',
                configuration: {
                    widgetId: 'user-list-widget',
                    title: 'User-List',
                    actions: [],
                    settings: {
                        properties: [
                            {
                                name: 'UserID',
                                displayName: 'ID'
                            },
                            {
                                name: 'UserFirstname',
                                displayName: 'Vorname'
                            },
                            {
                                name: 'UserLastname',
                                displayName: 'Nachname'
                            },
                            {
                                name: 'UserEmail',
                                displayName: 'Email'
                            }
                        ],
                        limit: 10
                    },
                    show: true,
                    size: WidgetSize.LARGE
                }
            }
        ];
        const sidebarConfiguredWidgets: ConfiguredWidget[] = [
            {
                instanceId: '20170915101514',
                configuration: {
                    widgetId: 'notes-widget',
                    title: "Notes",
                    actions: [],
                    settings: {
                        notes: 'Test <strong style="color:red">123</strong>'
                    },
                    show: true,
                    size: WidgetSize.SMALL
                },
            },
            {
                instanceId: '20170915094112',
                configuration: {
                    widgetId: 'notes-widget',
                    title: "Notes 2",
                    actions: [],
                    settings: {
                        notes: ""
                    },
                    show: true,
                    size: WidgetSize.SMALL
                },
            },
            {
                instanceId: '20170915085411',
                configuration: {
                    widgetId: 'ticket-info-widget',
                    title: "Ticket-Info",
                    actions: [],
                    settings: {},
                    show: true,
                    size: WidgetSize.SMALL
                }
            }
        ];

        return { contentRows, SidebarRows, contentConfiguredWidgets, sidebarConfiguredWidgets };
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
