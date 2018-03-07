import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { Contact, Customer, Ticket } from '@kix/core/dist/model';
import { ILabelProvider } from '@kix/core/dist/browser';

export class TicketInfoComponentState extends WidgetComponentState<any> {

    public constructor(
        public ticket: Ticket = null,
        public ticketId: number = null,
        public isPending: boolean = false,
        public isAccountTimeEnabled: boolean = false,
        public labelProvider: ILabelProvider<Ticket> = null,
        public customer: Customer = null,
        public contact: Contact = null
    ) {
        super();
    }

}
