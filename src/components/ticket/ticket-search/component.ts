import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";
import { TicketProperty } from "@kix/core/dist/model/";
import { TicketService } from "@kix/core/dist/browser/ticket/TicketService";

class TicketSearchComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            properties: [],
            ticketProperties: []
        };
    }

    public async onMount(): Promise<void> {
        TicketService.getInstance().addStateListener(this.ticketStateChanged.bind(this));

        this.state.ticketProperties = Object.keys(TicketProperty).map(
            (key) => [TicketProperty[key], key]
        ) as Array<[string, string]>;
        this.state.ticketProperties = this.state.ticketProperties.sort((a, b) => a[1].localeCompare(b[1]));

        this.openSearchDialog();
    }

    private openSearchDialog(): void {
        ApplicationService.getInstance().toggleMainDialog(
            'ticket-search-dialog-content', { properties: this.state.properties }
        );
    }

    private isPropertySelected(property: string): boolean {
        return this.state.properties.findIndex((p) => p === property) > -1;
    }

    private ticketPropertiesChanged(event: any): void {
        const selectedProperties: string[] = [];
        for (const selectedProperty of event.target.selectedOptions) {
            selectedProperties.push(selectedProperty.value);
        }
        TicketService.getInstance().prepareSearchProperties('ticket-search', selectedProperties);
    }

    private ticketStateChanged(): void {
        const properties = TicketService.getInstance().getTicketsSearchProperties('ticket-search');
        this.state.properties = properties ? properties : [];
    }

}

module.exports = TicketSearchComponent;
