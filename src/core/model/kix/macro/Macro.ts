/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { MacroAction } from "./MacroAction";

export class Macro extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.MACRO;

    public ID: number;

    public Name: string;

    public Type: string;

    public ExecOrder: number[];

    public Actions: MacroAction[];

    public constructor(macro?: Macro) {
        super(macro);
        if (macro) {
            this.ID = macro.ID;
            this.Name = macro.Name;
            this.Type = macro.Type;
            this.ExecOrder = macro.ExecOrder;
            this.Actions = macro.Actions;
        }
    }

}