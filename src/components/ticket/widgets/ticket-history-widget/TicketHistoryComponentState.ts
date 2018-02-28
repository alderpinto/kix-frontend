import { TicketHistory, WidgetConfiguration } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/browser/model/';
import { StandardTable } from '@kix/core/dist/browser';
import { TicketHistorySettings } from './TicketHistorySettings';

export class TicketHistoryComponentState extends WidgetComponentState<TicketHistorySettings> {

    public ticketId: number = null;

    public historyTableConfiguration: StandardTable<TicketHistory> = null;

    public filterValue: string = '';

}
