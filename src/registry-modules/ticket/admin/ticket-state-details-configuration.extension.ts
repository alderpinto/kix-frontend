import { IConfigurationExtension } from '../../../core/extensions';
import {
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize
} from '../../../core/model';
import { TicketStateDetailsContext } from '../../../core/browser/ticket';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'ticket-state-details';
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const ticketStateDetailsWidget = new ConfiguredWidget('ticket-state-details-widget', new WidgetConfiguration(
            'ticket-state-info-widget', 'State Information', ['ticket-admin-state-edit'], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const textmodulesWidget = new ConfiguredWidget('ticket-state-assigned-textmodules', new WidgetConfiguration(
            'ticket-state-assigned-textmodules', 'Assign Text Modules',
            ['ticket-admin-state-textmodules-edit'], null, false, true, WidgetSize.BOTH, null, false
        ));

        return new ContextConfiguration(
            TicketStateDetailsContext.CONTEXT_ID, [], [], [], [],
            ['ticket-state-assigned-textmodules'], [textmodulesWidget],
            ['ticket-state-details-widget'], [ticketStateDetailsWidget],
            [], [],
            ['ticket-admin-state-create'],
            ['ticket-admin-state-duplication', 'ticket-admin-state-edit', 'ticket-admin-state-delete']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
