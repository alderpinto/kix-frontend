/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.showToggle = typeof input.showToggle !== 'undefined' ? input.showToggle : true;
        if (this.state.showToggle) {
            this.state.toggled = typeof input.toggle !== 'undefined' ? input.toggle : false;
        } else {
            this.state.toggled = false;
        }
        this.state.label = input.label;
    }

    public async onMount(): Promise<void> {
        await this.state.label.init();
        this.state.prepared = true;
    }

    public labelClicked(event: any): void {
        if (this.state.showToggle) {
            this.state.toggled = !this.state.toggled;
        } else {
            this.state.toggled = false;
        }
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('labelClicked');
    }

    public removeLabel(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('removeLabel');
    }
}

module.exports = Component;
