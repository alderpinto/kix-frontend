/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../base-components/webapp/core/WidgetComponentState';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public prepared: boolean = false,
        public viewLabel: string = 'Translatable#Week',
        public view: string = 'month',
        public currentDate: string = '',
        public calendars: any[] = [],
        public loading: boolean = false
    ) {
        super();
    }

}
