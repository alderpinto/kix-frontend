import { FormField, FormDropdownItem, TreeNode, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputServiceComponentState extends FormInputComponentState {

    public constructor(
        public nodes: TreeNode[] = [],
        public currentNode: TreeNode = null,
        public invalid: boolean = false
    ) {
        super();
    }

}
