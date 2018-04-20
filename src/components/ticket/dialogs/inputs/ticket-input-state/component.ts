import { TicketInputStateComponentState } from "./TicketInputStateComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState } from "@kix/core/dist/model";

class TicketInputStateComponent {

    private state: TicketInputStateComponentState;

    public onCreate(): void {
        this.state = new TicketInputStateComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.states.map((t) =>
            new FormDropdownItem(t.ID, new ObjectIcon(TicketProperty.STATE_ID, t.ID), t.Name)
        );
    }

    public itemChanged(item: FormDropdownItem): void {
        this.state.pending = false;
        this.state.currentItem = item;
        if (item) {
            const objectData = ContextService.getInstance().getObjectData();
            const state = objectData.states.find((s) => s.ID === item.id);
            if (state) {
                const stateType = objectData.stateTypes.find((t) => t.ID === state.TypeID);
                this.state.pending = stateType && stateType.Name.toLocaleLowerCase().indexOf('pending') >= 0;
            }
        }
    }

}

module.exports = TicketInputStateComponent;
