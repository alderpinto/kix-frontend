/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { Attachment } from '../../../../../model/kix/Attachment';
import { FormService } from '../../core/FormService';

class Component extends FormInputComponent<any, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        if (Array.isArray(this.state.field.options)) {
            this.state.field.options.forEach((o) => this.state.options.push([o.option, o.value]));
        }
        this.state.prepared = true;
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<Array<Attachment | File> | Attachment | File>(
            this.state.field.instanceId
        );
        if (value) {
            this.state.attachments = Array.isArray(value.value)
                ? value.value
                : this.state.attachments = [value.value];
        }
    }

    public valueChanged(value: Array<Attachment | File>): void {
        super.provideValue(value);
    }

}

module.exports = Component;
