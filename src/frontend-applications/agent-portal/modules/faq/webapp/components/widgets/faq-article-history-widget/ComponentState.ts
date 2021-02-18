/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { Table } from '../../../../../base-components/webapp/core/table';
import { AbstractAction } from '../../../../../../modules/base-components/webapp/core/AbstractAction';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public table: Table = null,
        public actions: AbstractAction[] = [],
        public filterCount: number = null
    ) {
        super();
    }

}
