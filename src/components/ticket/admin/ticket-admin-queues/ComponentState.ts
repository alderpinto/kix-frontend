import { IdService } from "../../../../core/browser";
import {
    WidgetConfiguration, KIXObjectType, SortOrder, TableWidgetSettings, TicketTemplateProperty
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-queues-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Ticket: Queues',
            [
                'ticket-admin-queue-create', 'csv-export-action'
            ],
            new TableWidgetSettings(KIXObjectType.QUEUE, [TicketTemplateProperty.NAME, SortOrder.UP]),
            false, false, null, 'kix-icon-gears')
    ) { }

}
