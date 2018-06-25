import { TicketInputTicketNumberComponentState } from "./TicketInputTicketNumberComponentState";
import { FormInputComponent } from "@kix/core/dist/model";

class TicketInputFulltextComponent extends FormInputComponent<string, TicketInputTicketNumberComponentState> {

    public onCreate(): void {
        this.state = new TicketInputTicketNumberComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
    }

}

module.exports = TicketInputFulltextComponent;
