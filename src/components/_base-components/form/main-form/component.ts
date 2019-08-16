/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormComponentState } from './FormComponentState';
import { WidgetType, FormContext, FormField } from '../../../../core/model';
import { FormService } from '../../../../core/browser/form';
import { WidgetService } from '../../../../core/browser';

class FormComponent {

    private state: FormComponentState;

    public onCreate(input: any): void {
        this.state = new FormComponentState(input.formId);
    }

    public onInput(input: any): void {
        if (!this.state.formId && !this.state.formInstance) {
            this.state.formId = input.formId;
            this.prepareForm();
        }
    }

    public async onMount(): Promise<void> {
        if (!this.state.formInstance) {
            this.prepareForm();
        }
    }

    private async prepareForm(): Promise<void> {
        this.state.formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (this.state.formInstance) {
            this.state.additionalFieldControlsNeeded = false;
            for (const group of this.state.formInstance.getForm().groups) {
                for (const field of group.formFields) {
                    this.state.additionalFieldControlsNeeded = this.additionalFieldControlsNeeded(field);
                    if (this.state.additionalFieldControlsNeeded) {
                        break;
                    }
                }
                if (this.state.additionalFieldControlsNeeded) {
                    break;
                }
            }
            this.state.objectType = this.state.formInstance.getObjectType();
            this.state.isSearchContext = this.state.formInstance.getFormContext() === FormContext.SEARCH;
            WidgetService.getInstance().setWidgetType('form-group', WidgetType.GROUP);
            this.state.loading = false;

            this.prepareMultiGroupHandling();
        }
    }

    private additionalFieldControlsNeeded(field: FormField): boolean {
        let needed = field.countMax > 1 || field.countDefault < field.countMax;
        if (!needed && field.children) {
            for (const child of field.children) {
                needed = this.additionalFieldControlsNeeded(child);
                if (needed) {
                    break;
                }
            }
        }
        return needed;
    }

    private prepareMultiGroupHandling(): void {
        if (this.state.formInstance) {
            const form = this.state.formInstance.getForm();
            if (form && form.singleFormGroupOpen && form.groups.length > 1) {
                const formElement = (this as any).getEl();
                if (formElement) {
                    formElement.style.opacity = 0;
                    setTimeout(() => {
                        this.handleFormGroupMinimizeState(form.groups[0].name, false);
                        formElement.style.opacity = null;
                    }, 50);
                }
            }
        }
    }

    public handleFormGroupMinimizeState(groupName: string, minimized: boolean): void {
        if (this.state.formInstance) {
            const form = this.state.formInstance.getForm();
            if (form && form.singleFormGroupOpen && form.groups.length > 1) {
                const otherGroups = form.groups.filter((g) => g.name !== groupName);
                if (minimized === false) {
                    otherGroups.forEach((g) => {
                        const groupComponent = (this as any).getComponent(g.name);
                        if (groupComponent) {
                            groupComponent.setMinizedState(true);
                        }
                    });
                } else if (minimized === true && form.groups.length === 2) {
                    otherGroups.forEach((g) => {
                        const groupComponent = (this as any).getComponent(g.name);
                        if (groupComponent) {
                            groupComponent.setMinizedState(false);
                        }
                    });
                }
            }
        }
    }
}

module.exports = FormComponent;
