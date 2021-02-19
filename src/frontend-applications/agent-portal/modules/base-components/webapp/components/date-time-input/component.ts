/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { FormService } from '../../core/FormService';

class Component extends FormInputComponent<string | Date, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);

        this.state.currentValue = typeof input.currentValue !== 'undefined' ?
            input.currentValue : this.state.currentValue;
        if (this.state.field && this.state.field.options) {
            const typeOption = this.state.field.options.find(
                (o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE
            );
            if (typeOption) {
                this.state.inputType = typeOption.value.toString();
            }

            const minDateOption = this.state.field.options.find((o) => o.option === FormFieldOptions.MIN_DATE);
            this.state.minDate = minDateOption ? minDateOption.value : null;

            const maxDateOption = this.state.field.options.find((o) => o.option === FormFieldOptions.MAX_DATE);
            this.state.maxDate = maxDateOption ? maxDateOption.value : null;
        }
        this.update();
    }

    private async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';
        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async setCurrentValue(): Promise<void> {
        this.state.prepared = false;
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<string>(this.state.field.instanceId);
        if (value && value.value) {
            this.state.currentValue = new Date(value.value);
            this.state.dateValue = DateTimeUtil.getKIXDateString(this.state.currentValue);
            this.state.timeValue = DateTimeUtil.getKIXTimeString(this.state.currentValue, true);
        }

        setTimeout(() => {
            this.state.prepared = true;
        }, 50);
    }

    public dateChanged(event: any): void {
        if (event) {
            this.state.dateValue = event.target && event.target.value !== '' ? event.target.value : null;
            this.setValue();
        }
    }

    public timeChanged(event: any): void {
        if (event) {
            this.state.timeValue = event.target && event.target.value !== '' ? event.target.value : null;
            this.setValue();
        }
    }

    private setValue(): void {
        const date = this.state.dateValue ? new Date(
            this.state.dateValue + (this.state.timeValue ? ` ${this.state.timeValue}` : '')
        ) : null;

        if (date && this.state.inputType !== 'DATE_TIME') {
            date.setHours(0, 0, 0, 0);
        }

        this.state.currentValue = date;

        (this as any).emit('valueChanged', this.state.currentValue);
        super.provideValue(this.state.currentValue);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
