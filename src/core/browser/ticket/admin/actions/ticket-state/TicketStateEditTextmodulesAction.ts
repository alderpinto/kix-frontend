import { AbstractAction } from "../../../../../model";

export class TicketStateEditTextmodulesAction extends AbstractAction {

    public initAction(): void {
        this.text = "Bearbeiten";
        this.icon = "kix-icon-edit";
    }

}
