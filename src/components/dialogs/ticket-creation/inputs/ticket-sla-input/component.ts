import { TicketStore, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/";
import { SLA_ID_CHANGED } from '@kix/core/dist/model/client/';

class TicketSLAInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            slaId: null
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getInstance().getStore().dispatch(SLA_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState = TicketStore.getInstance().getTicketCreationState();
        this.state.slaId = reduxState.slaId;
    }

}

module.exports = TicketSLAInput;
