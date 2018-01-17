import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';
import { TicketHistoryWidget } from './TicketHistoryWidget';

export class TicketHistoryWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "ticket-history-widget";

    public type: WidgetType = WidgetType.LANE;

    public createWidget(): IWidget {
        return new TicketHistoryWidget(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        return new WidgetConfiguration(
            this.widgetId, 'Ticket-History', [], {}, this.type, true, WidgetSize.BOTH, 'minus'
        );
    }

}

module.exports = (data, host, options) => {
    return new TicketHistoryWidgetFactoryExtension();
};
