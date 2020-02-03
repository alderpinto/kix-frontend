/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { DynamicFieldFormUtil } from '../../../../base-components/webapp/core/DynamicFieldFormUtil';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.checklist) {
            const values = DynamicFieldFormUtil.countValues(input.checklist);
            this.state.progressValue = values[0];
            this.state.progressMax = values[1];
        }
    }

}

module.exports = Component;
