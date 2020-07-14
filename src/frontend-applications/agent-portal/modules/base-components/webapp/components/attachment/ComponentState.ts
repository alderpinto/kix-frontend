/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { AbstractComponentState } from '../../core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public count: number = 0,
        public dragging: boolean = false,
        public minimized: boolean = true,
        public labels: Label[] = [],
        public multiple: boolean = true,
        public accept: string = null,
    ) {
        super();
    }
}