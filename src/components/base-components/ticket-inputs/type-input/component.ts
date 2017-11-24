import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';

export class TypeInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: null,
            types: [],
            typeId: null
        };
    }

    public onInput(input: any): void {
        this.state.ticketDataId = input.ticketDataId;
        this.state.typeId = Number(input.value);
        TicketStore.getInstance().addStateListener(this.ticketDataStateChanged.bind(this));
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.typeId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.typeId);
    }

    private ticketDataStateChanged(): void {
        this.setStoreData();
    }

    private setStoreData(): void {
        const ticketData = TicketStore.getInstance().getTicketData(this.state.ticketDataId);
        if (ticketData) {
            this.state.types = ticketData.types;
        }
    }

}

module.exports = TypeInputComponent;
