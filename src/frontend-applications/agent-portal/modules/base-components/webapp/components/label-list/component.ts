/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { SortUtil } from '../../../../../model/SortUtil';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';

class LabelListComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentState): void {
        this.state.removeLabels = typeof input.removeLabels !== 'undefined' ? input.removeLabels : true;
        if (input.labels) {
            this.state.labels = input.labels.sort(
                (a, b) => {
                    if (a.object && b.object) {
                        return SortUtil.compareString(a.object.KIXObjectType, b.object.KIXObjectType);
                    }
                    return 0;
                }
            );
        }
    }

    public removeLabel(label: Label): void {
        (this as any).emit('removeLabel', label);
    }
}

module.exports = LabelListComponent;
