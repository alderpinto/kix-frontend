import { Link, TicketDetails, WidgetConfiguration } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { LinkedObjectsSettings } from './LinkedObjectsSettings';
import { TicketData } from '@kix/core/dist/browser/ticket/TicketData';
import { StandardTableConfiguration } from '@kix/core/dist/browser';

export class LinkedObjectsWidgetComponentState extends WidgetComponentState<LinkedObjectsSettings> {

    public ticketId: number = null;

    public ticketDetails: TicketDetails = null;

    public linkCount: number = 0;

    public linkedObjectGroups: Array<[string, number, StandardTableConfiguration<any>]> = [];

}
