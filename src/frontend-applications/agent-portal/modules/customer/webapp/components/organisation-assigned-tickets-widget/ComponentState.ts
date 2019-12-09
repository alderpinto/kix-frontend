/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from "../../../../../modules/base-components/webapp/core/WidgetComponentState";
import { Organisation } from "../../../model/Organisation";
import { ITable } from "../../../../base-components/webapp/core/table";
import { AbstractAction } from "../../../../../modules/base-components/webapp/core/AbstractAction";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public organisation: Organisation = null,
        public reminderTicketsTable: ITable = null,
        public reminderFilterValue: string = null,
        public newTicketsTable: ITable = null,
        public newFilterValue: string = null,
        public openTicketsTable: ITable = null,
        public openFilterValue: string = null,
        public pendingTicketsTable: ITable = null,
        public pendingFilterValue: string = null,
        public actions: AbstractAction[] = [],
        public reminderTicketsCount: number = 0,
        public newTicketsCount: number = 0,
        public openTicketsCount: number = 0,
        public pendingTicketsCount: number = 0,
        public reminderTicketsFilterCount: number = null,
        public newTicketsFilterCount: number = null,
        public openTicketsFilterCount: number = null,
        public pendingTicketsFilterCount: number = null,
        public reminderTicketsTitle: string = '',
        public newTicketsTitle: string = '',
        public openTicketsTitle: string = '',
        public pendingTicketsTitle: string = '',
        public widgetTitle: string = ''
    ) {
        super();
    }

}
