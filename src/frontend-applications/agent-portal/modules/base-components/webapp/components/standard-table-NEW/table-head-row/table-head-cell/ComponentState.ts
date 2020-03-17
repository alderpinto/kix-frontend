/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IColumn } from "../../../../core/table";
import { ObjectIcon } from "../../../../../../icon/model/ObjectIcon";

export class ComponentState {

    public loading: boolean = true;
    public column: IColumn = null;
    public icon: string | ObjectIcon = null;
    public title: string = '';
    public size: number = 100;
    public isSorted: boolean = false;
    public sortOrderDown: boolean = false;
    public resizeActive: boolean = false;
    public filterHovered: boolean = false;
    public filterIsShown: boolean = false;

}
