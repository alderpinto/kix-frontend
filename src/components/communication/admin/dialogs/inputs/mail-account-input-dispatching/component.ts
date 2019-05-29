import { ComponentState } from "./ComponentState";
import { TicketProperty, TreeNode, FormInputComponent, FormFieldOptions } from "../../../../../../core/model";
import { TicketService } from "../../../../../../core/browser/ticket";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<number[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const validOption = this.state.field.options
            ? this.state.field.options.find((o) => o.option === FormFieldOptions.SHOW_INVALID)
            : null;

        const showInvalid = validOption ? validOption.value : false;

        const queueNodes = await TicketService.getInstance().getTreeNodes(
            TicketProperty.QUEUE_ID, showInvalid
        );
        this.state.nodes = [
            new TreeNode('USE_DEFAULT', 'Translatable#Default'),
            ...queueNodes
        ];
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
        } else {
            this.state.currentNode = this.state.nodes.find((n) => n.id === 'USE_DEFAULT');
        }
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public nodeChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;