/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from "../../../../core/browser";
import {
    WidgetConfiguration, KIXObjectType, SortOrder, TicketPriorityProperty, TableWidgetSettings
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('ticket-priorities-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Ticket: Priorities',
            [
                'ticket-admin-priority-create', 'ticket-admin-priority-table-delete',
                'ticket-admin-priority-import', 'csv-export-action'
            ],
            new TableWidgetSettings(KIXObjectType.TICKET_PRIORITY,
                [TicketPriorityProperty.NAME, SortOrder.UP]), false, false, 'kix-icon-gears')
    ) { }

}
