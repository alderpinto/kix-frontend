/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormInstance } from '../../../../../modules/base-components/webapp/core/FormInstance';
import { ValidationSeverity } from '../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { ValidationResult } from '../../../../../modules/base-components/webapp/core/ValidationResult';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { EventService } from '../../core/EventService';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { FormEvent } from '../../core/FormEvent';


class FormComponent {

    private state: ComponentState;
    private changePageTimeout: any;
    private keyListenerElement: any;
    private keyListener: any;
    private formSubscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.formId);
    }

    public onInput(input: any): void {
        if (!this.state.formId && !this.state.formInstance) {
            this.state.formId = input.formId;
            this.prepareForm();
        }
    }

    public async onMount(): Promise<void> {
        if (!this.state.formInstance) {
            await this.prepareForm();

            this.keyListenerElement = (this as any).getEl();
            if (this.keyListenerElement) {
                this.keyListenerElement.dispatchEvent(new KeyboardEvent('keypress', { key: 'Tab' }));
                this.keyListener = this.keyDown.bind(this);
                this.keyListenerElement.addEventListener('keydown', this.keyListener);

                setTimeout(() => {
                    const elements = this.keyListenerElement.getElementsByClassName('field-input');
                    if (elements && elements.length) {
                        elements.item(0).firstElementChild.focus();
                    }
                }, 500);
            }
        }
    }

    public onDestroy(): void {
        if (this.keyListenerElement) {
            this.keyListenerElement.removeEventListener('keydown', this.keyDown.bind(this));
        }

        EventService.getInstance().unsubscribe(FormEvent.FORM_FIELD_ORDER_CHANGED, this.formSubscriber);
        EventService.getInstance().unsubscribe(FormEvent.FIELD_CHILDREN_ADDED, this.formSubscriber);
        EventService.getInstance().unsubscribe(FormEvent.FIELD_REMOVED, this.formSubscriber);
        EventService.getInstance().unsubscribe(FormEvent.FORM_PAGE_ADDED, this.formSubscriber);
        EventService.getInstance().unsubscribe(FormEvent.FORM_PAGES_REMOVED, this.formSubscriber);
    }

    public keyDown(event: any): void {
        if ((event.ctrlKey && event.key === 'Enter')) {
            if (event.preventDefault) {
                event.preventDefault();
            }

            EventService.getInstance().publish(ApplicationEvent.DIALOG_SUBMIT, { formId: this.state.formId });
        }
    }

    private async prepareForm(): Promise<void> {
        this.state.formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (this.state.formInstance) {
            this.setNeeded();
            this.state.objectType = this.state.formInstance.getObjectType();
            this.state.isSearchContext = this.state.formInstance.getFormContext() === FormContext.SEARCH;
            WidgetService.getInstance().setWidgetType('form-group', WidgetType.GROUP);

            this.state.loading = false;

            this.prepareMultiGroupHandling();

            this.formSubscriber = {
                eventSubscriberId: this.state.formId,
                eventPublished: (data: any, eventId: string) => {
                    this.setNeeded();
                    (this as any).setStateDirty('formInstance');
                }
            };
            EventService.getInstance().subscribe(FormEvent.FORM_FIELD_ORDER_CHANGED, this.formSubscriber);
            EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
            EventService.getInstance().subscribe(FormEvent.FIELD_CHILDREN_ADDED, this.formSubscriber);
            EventService.getInstance().subscribe(FormEvent.FIELD_REMOVED, this.formSubscriber);
            EventService.getInstance().subscribe(FormEvent.FORM_PAGE_ADDED, this.formSubscriber);
            EventService.getInstance().subscribe(FormEvent.FORM_PAGES_REMOVED, this.formSubscriber);
        }
    }

    private setNeeded(): void {
        this.state.additionalFieldControlsNeeded = false;
        PAGES: for (const page of this.state.formInstance.getForm().pages) {
            for (const group of page.groups) {
                for (const field of group.formFields) {
                    this.state.additionalFieldControlsNeeded = this.additionalFieldControlsNeeded(field);
                    if (this.state.additionalFieldControlsNeeded) {
                        break PAGES;
                    }
                }
            }
        }
    }

    private additionalFieldControlsNeeded(field: FormFieldConfiguration): boolean {
        let needed = field.countMax > 1
            || field.countDefault < field.countMax
            || (!field.countMax && !field.countDefault);
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
            if (!isNaN(this.state.activePageIndex)) {
                const page = form.pages[this.state.activePageIndex];
                if (form && page && page.singleFormGroupOpen && page.groupConfigurationIds.length > 1) {
                    const formElement = (this as any).getEl();
                    if (formElement) {
                        formElement.style.opacity = 0;
                        setTimeout(() => {
                            this.handleFormGroupMinimizeState(form.pages[0].name, false);
                            formElement.style.opacity = null;
                        }, 50);
                    }
                }
            }
        }
    }

    public handleFormGroupMinimizeState(groupName: string, minimized: boolean): void {
        if (this.state.formInstance) {
            const form = this.state.formInstance.getForm();
            if (!isNaN(this.state.activePageIndex)) {
                const page = form.pages[this.state.activePageIndex];
                if (form && page && page.singleFormGroupOpen && page.groupConfigurationIds.length > 1) {
                    const otherGroups = page.groups.filter((g) => g.name !== groupName);
                    if (minimized === false) {
                        otherGroups.forEach((g) => {
                            const groupComponent = (this as any).getComponent(g.name);
                            if (groupComponent) {
                                groupComponent.setMinizedState(true);
                            }
                        });
                    } else if (minimized === true && page.groupConfigurationIds.length === 2) {
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

    public showPage(index: number): void {
        const pages = this.state.formInstance.getForm().pages;
        if (index < 0) {
            index = 0;
        } else if (index > pages.length - 1) {
            index = pages.length - 1;
        }
        if (this.changePageTimeout) {
            clearTimeout(this.changePageTimeout);
        }
        this.changePageTimeout = setTimeout(async () => {
            clearTimeout(this.changePageTimeout);
            const validateOk = await this.validateActivePage();
            if (validateOk) {
                this.state.activePageIndex = index;
            }
        }, 150);
    }

    private async validateActivePage(): Promise<boolean> {
        let validateOk = true;
        const formInstance = (this.state.formInstance as FormInstance);
        const result = await formInstance.validatePage(
            formInstance.getForm().pages[this.state.activePageIndex]
        );
        if (result.some((r) => r.severity === ValidationSeverity.ERROR)) {
            validateOk = false;
            this.showValidationError(result);
        }
        return validateOk;
    }

    private async showValidationError(result: ValidationResult[]): Promise<void> {
        const errorMessages = [];

        result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message).forEach((m) => {
            if (!errorMessages.some((em) => em === m)) {
                errorMessages.push(m);
            }
        });

        const title = await TranslationService.translate('Translatable#Error on form page validation:');
        const content = new ComponentContent('list-with-title',
            {
                title,
                list: errorMessages
            }
        );

        const toastTitle = await TranslationService.translate('Translatable#Validation error');
        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, toastTitle, null, true
        );
    }
}

module.exports = FormComponent;
