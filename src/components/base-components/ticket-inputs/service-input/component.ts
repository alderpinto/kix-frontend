import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';

export class ServiceInputComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            ticketDataId: null,
            services: [],
            serviceId: null,
        };
    }

    public onInput(input: any): void {
        this.state.ticketDataId = input.ticketDataId;
        this.state.serviceId = Number(input.value);
        TicketStore.getInstance().addStateListener(this.ticketDataStateChanged.bind(this));
    }

    public onMount(): void {
        this.setStoreData();
    }

    private valueChanged(event: any): void {
        this.state.serviceId = Number(event.target.value);
        (this as any).emit('valueChanged', this.state.serviceId);
    }

    private ticketDataStateChanged(): void {
        this.setStoreData();
    }

    private setStoreData(): void {
        const ticketData = TicketStore.getInstance().getTicketData(this.state.ticketDataId);
        if (ticketData) {
            this.state.services = ticketData.services;
        }
    }

}

module.exports = ServiceInputComponent;
