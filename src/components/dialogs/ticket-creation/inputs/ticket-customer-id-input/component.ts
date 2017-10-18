import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';

class TicketCustomerIdInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        super.initialize(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        console.log("stateChanged");
    }

}

module.exports = TicketCustomerIdInput;
