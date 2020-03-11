/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IRow } from "../../../../core/table";


export class ComponentState {

    public constructor(
        public row: IRow = null,
        public children: IRow[] = [],
        public open: boolean = false,
        public selected: boolean = false,
        public selectable: boolean = true,
        public show: boolean = false,
        public rowClasses: string[] = []
    ) { }
}
