import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';

class TicketTypeInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
    }

    public stateChanged(state: TicketCreationReduxState): void {
        console.log("stateChanged");
    }

}

module.exports = TicketTypeInput;
