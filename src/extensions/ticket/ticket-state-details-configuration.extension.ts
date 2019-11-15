/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, TabWidgetConfiguration
} from '../../core/model';
import { TicketStateDetailsContext } from '../../core/browser/ticket';
import { ModuleConfigurationService } from '../../services';
import { ConfigurationType, ConfigurationDefinition, IConfiguration } from '../../core/model/configuration';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-state-details';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const ticketStateInfoTab = new WidgetConfiguration(
            'ticket-state-details-info-widget', 'Ticket State Details Info Widget', ConfigurationType.Widget,
            'ticket-state-info-widget', 'Translatable#State Information',
            [], null, null, false, true, null, false
        );
        configurations.push(ticketStateInfoTab);

        const tabWidgetSettings = new TabWidgetConfiguration(
            'ticket-state-details-tab-widget-config', 'Ticket State Details Tabs', ConfigurationType.TabWidget,
            ['ticket-state-details-info-widget']
        );
        configurations.push(tabWidgetSettings);

        const tabWidgetConfig = new WidgetConfiguration(
            'ticket-state-details-tab-widget', 'Ticket State Details Tab Widget', ConfigurationType.Widget,
            'tab-widget', '', [],
            new ConfigurationDefinition('ticket-state-details-tab-widget-config', ConfigurationType.TabWidget)
        );
        configurations.push(tabWidgetConfig);

        configurations.push(
            new ContextConfiguration(
                'ticket-state-details', 'Ticket State Details', ConfigurationType.Context,
                TicketStateDetailsContext.CONTEXT_ID, [], [],
                [
                    new ConfiguredWidget('ticket-state-details-tab-widget', 'ticket-state-details-tab-widget')
                ],
                [],
                [
                    'ticket-admin-state-create'
                ],
                [
                    'ticket-admin-state-edit', 'print-action'
                ],
                [],
                [
                    new ConfiguredWidget('ticket-state-details-info-widget', 'ticket-state-details-info-widget')
                ]
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
