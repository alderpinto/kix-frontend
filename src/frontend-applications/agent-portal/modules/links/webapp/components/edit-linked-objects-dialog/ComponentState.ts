/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from "../../../../../modules/base-components/webapp/core/AbstractComponentState";
import { ITable } from "../../../../base-components/webapp/core/table";
import { KIXObjectPropertyFilter } from "../../../../../model/KIXObjectPropertyFilter";


export class ComponentState extends AbstractComponentState {

    public constructor(
        public loading: boolean = false,
        public linkObjectCount: number = 0,
        public table: ITable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public canDelete: boolean = false,
        public canSubmit: boolean = false,
        public filterCount: number = null,
        public allowDelete: boolean = false,
        public allowCreate: boolean = false
    ) {
        super();
    }

}
