import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { TicketListContext } from '../context';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CRUD } from '../../../model';

export class ShowUserTicketsAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('tickets', [CRUD.READ])
    ];

    public async initAction(): Promise<void> {
        return;
    }

    public setText(text: string): void {
        this.text = text;
    }

    public async run(): Promise<void> {
        const ticketIds = this.data as number[];
        const context = await ContextService.getInstance().getContext<TicketListContext>(TicketListContext.CONTEXT_ID);
        await context.loadTickets(ticketIds, this.text);
        await ContextService.getInstance().setContext(TicketListContext.CONTEXT_ID, null, null, null, null, false);
    }

}
