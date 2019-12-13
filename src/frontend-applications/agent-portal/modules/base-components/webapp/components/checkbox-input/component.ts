/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';

class Component extends FormInputComponent<any, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.setCurrentValue();
    }

    public async setCurrentValue(): Promise<void> {
        if (this.state.defaultValue && typeof this.state.defaultValue.value !== 'undefined') {
            this.state.checked = Boolean(this.state.defaultValue.value);
            super.provideValue(this.state.checked);
        }
    }

    public checkboxClicked(): void {
        this.state.checked = !this.state.checked;
        super.provideValue(this.state.checked);
    }
}

module.exports = Component;
