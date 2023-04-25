/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../base-components/webapp/core/WidgetComponentState';
import { ChartConfiguration } from 'chart.js';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public title: string = 'Translatable#Report Chart',
        public chartConfig: ChartConfiguration = null,
        public prepared: boolean = true,
        public errorMessage: string = null
    ) {
        super();
    }

}