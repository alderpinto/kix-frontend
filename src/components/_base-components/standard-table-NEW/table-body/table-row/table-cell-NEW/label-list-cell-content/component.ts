/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, Label, ICell } from '../../../../../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell = input.cell;
        if (cell) {
            this.setLabels(cell);
        }
    }

    private async setLabels(cell: ICell): Promise<void> {
        let values = [];
        const value = cell.getValue();
        if (Array.isArray(value.objectValue)) {
            if (typeof value.objectValue[0] === 'object') {
                const stringValue = await cell.getDisplayValue();
                values = stringValue.split(',').map((v) => v.trim());
            } else {
                values = value.objectValue;
            }
        } else {
            values = [value.objectValue];
        }

        this.state.cellLabels = values.map((v) => new Label(null, v, null, v, null, v, false));
    }

}

module.exports = Component;
