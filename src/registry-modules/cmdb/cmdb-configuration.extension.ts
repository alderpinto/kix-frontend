import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, WidgetConfiguration, WidgetSize, ConfiguredWidget, ConfigItemProperty,
    FormField, VersionProperty, FormFieldOption, FormContext, KIXObjectType, Form,
    KIXObjectPropertyFilter, TableFilterCriteria, CRUD
} from '../../core/model';
import { CMDBContext, ConfigItemChartConfiguration } from '../../core/browser/cmdb';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService, CMDBService } from '../../core/services';
import { SearchOperator } from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return CMDBContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = ['20180830-cmdb-notes-sidebar'];

        const notesSidebar = new ConfiguredWidget('20180830-cmdb-notes-sidebar',
            new WidgetConfiguration(
                'notes-widget', 'Translatable#Notes', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-note', false
            ));

        const sidebarWidgets = [notesSidebar];

        const explorer = ['20180830-ci-class-explorer'];

        const ciClassExplorer = new ConfiguredWidget('20180830-ci-class-explorer',
            new WidgetConfiguration(
                'config-item-class-explorer', 'Translatable#CMDB Explorer', [], {}, false, false
            ),
            [new UIComponentPermission('system/cmdb/classes', [CRUD.READ])]
        );
        const explorerWidgets = [ciClassExplorer];


        // CONTENT WIDGETS

        const chartConfig1 = new ConfigItemChartConfiguration(ConfigItemProperty.CLASS_ID, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                legend: {
                    display: false
                }
            }
        });
        const chart1 = new ConfiguredWidget('20180903-cmdb-chart-1',
            new WidgetConfiguration(
                'config-item-chart-widget', 'Translatable#Number of Config Items', [], chartConfig1,
                false, true, WidgetSize.SMALL, null, true
            ),
            [new UIComponentPermission('cmdb/configitems', [CRUD.READ])]
        );

        const chartConfig2 = new ConfigItemChartConfiguration(ConfigItemProperty.CUR_DEPL_STATE_ID, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    label: '',
                    data: [],
                    fill: true,
                    backgroundColor: [
                        'rgba(255, 0, 0, 0.8)',
                        'rgba(255, 0, 0, 0.6)',
                        'rgba(255, 0, 0, 0.4)',
                        'rgba(255, 0, 0, 0.2)',
                        'rgba(0, 0, 255, 0.8)',
                        'rgba(0, 0, 255, 0.6)',
                        'rgba(0, 0, 255, 0.4)',
                        'rgba(0, 0, 255, 0.2)',
                        'rgba(0, 255, 0, 0.8)',
                        'rgba(0, 255, 0, 0.6)',
                        'rgba(0, 255, 0, 0.4)'
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
        const chart2 = new ConfiguredWidget('20180903-cmdb-chart-2',
            new WidgetConfiguration(
                'config-item-chart-widget', 'Translatable#Overview Config Items Deployment State', [], chartConfig2,
                false, true, WidgetSize.SMALL, null, true
            ),
            [new UIComponentPermission('cmdb/configitems', [CRUD.READ])]
        );

        const chartConfig3 = new ConfigItemChartConfiguration(ConfigItemProperty.CUR_INCI_STATE_ID, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                legend: {
                    display: true,
                    position: 'top'
                },
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        });
        const chart3 = new ConfiguredWidget('20180903-cmdb-chart-3',
            new WidgetConfiguration(
                'config-item-chart-widget', 'Translatable#Number of Config Items in critical incident state',
                [], chartConfig3, false, true, WidgetSize.SMALL, null, true
            ),
            [new UIComponentPermission('cmdb/configitems', [CRUD.READ])]
        );

        const content = [
            '20180903-cmdb-chart-1', '20180903-cmdb-chart-2', '20180903-cmdb-chart-3', '20180905-ci-list-widget'
        ];

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const deploymentStates = await CMDBService.getInstance().getDeploymentStates(serverConfig.BACKEND_API_TOKEN);
        const filter: KIXObjectPropertyFilter[] = [];
        deploymentStates.forEach(
            (ds) => filter.push(new KIXObjectPropertyFilter(ds.Name, [
                new TableFilterCriteria(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, SearchOperator.EQUALS, ds.ItemID
                )
            ])));

        const ciListWidget = new ConfiguredWidget('20180905-ci-list-widget',
            new WidgetConfiguration(
                'table-widget', 'Translatable#Overview Config Items', [
                    'bulk-action', 'ticket-create-action', 'config-item-create-action', 'csv-export-action'
                ],
                { objectType: KIXObjectType.CONFIG_ITEM }, false, false, WidgetSize.LARGE, 'kix-icon-ci', true, filter
            ),
            [new UIComponentPermission('cmdb/configitems', [CRUD.READ])]
        );

        const contentWidgets = [chart1, chart2, chart3, ciListWidget];

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            explorer, explorerWidgets,
            [], [],
            [], [],
            content, contentWidgets
        );
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const linkFormId = 'link-config-item-search-form';
        const existingForm = configurationService.getModuleConfiguration(linkFormId, null);
        if (!existingForm || overwrite) {
            const fields: FormField[] = [];
            fields.push(
                new FormField(
                    'Translatable#Config Item Class', ConfigItemProperty.CLASS_ID,
                    'ci-class-input', false,
                    'Translatable#Search for config items within the choosen class.'
                )
            );
            fields.push(new FormField('Translatable#Name', ConfigItemProperty.NAME, null, false, 'Translatable#Search for config items with the same name or part of the same name (min. 1 character).'));
            fields.push(new FormField('Translatable#Number', ConfigItemProperty.NUMBER, null, false, 'Translatable#Serach for config items with the same number or part of the same number (min. 1 character).'));
            fields.push(new FormField(
                'Translatable#Deployment State', VersionProperty.CUR_DEPL_STATE_ID, 'general-catalog-input',
                false, 'Translatable#Search for config items with the same deployment state.',
                [new FormFieldOption('GC_CLASS', 'ITSM::ConfigItem::DeploymentState')],
                null, null, null, 1, 1, 1, null, null, null, false, false
            ));
            fields.push(new FormField(
                'Translatable#Incident State', VersionProperty.CUR_INCI_STATE_ID, 'general-catalog-input',
                false, 'Translatable#Search for config items with the same incident state.',
                [new FormFieldOption('GC_CLASS', 'ITSM::Core::IncidentState')],
                null, null, null, 1, 1, 1, null, null, null, false, false
            ));

            const group = new FormGroup('Translatable#Config Item Data', fields);

            const form = new Form(
                linkFormId, 'Translatable#Link Config Item with', [group], KIXObjectType.CONFIG_ITEM, false, FormContext.LINK
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm(
            [FormContext.LINK], KIXObjectType.CONFIG_ITEM, linkFormId
        );
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
