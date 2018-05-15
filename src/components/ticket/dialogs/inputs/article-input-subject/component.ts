import { ArticleInputSubjectComponentState } from "./ArticleInputSubjectComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, TreeNode, FormFieldValue, FormInputComponent
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class ArticleInputSubjectComponent extends FormInputComponent<string, ArticleInputSubjectComponentState> {

    public onCreate(): void {
        this.state = new ArticleInputSubjectComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
    }

    public setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<string>(this.state.field.property);
            if (value) {
                this.state.currentValue = value.value;
            }
        }
    }

    private valueChanged(value: string): void {
        this.state.currentValue = value;
        super.provideValue(value);
    }

}

module.exports = ArticleInputSubjectComponent;
