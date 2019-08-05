/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "./../KIXObject";
import { KIXObjectType } from "./../KIXObjectType";
import { MailFilterMatch } from "./MailFilterMatch";
import { MailFilterSet } from "./MailFilterSet";

export class MailFilter extends KIXObject {

    public KIXObjectType: KIXObjectType;

    public ObjectId: string | number;

    public ID: string | number;
    public Name: string;
    public StopAfterMatch: number;
    public Match: MailFilterMatch[];
    public Set: MailFilterSet[];

    public constructor(mailFilter?: MailFilter) {
        super(mailFilter);
        if (mailFilter) {
            this.ID = mailFilter.ID;
            this.ObjectId = this.ID;
            this.Name = mailFilter.Name;
            this.StopAfterMatch = mailFilter.StopAfterMatch;
            this.Match = mailFilter.Match;
            this.Set = mailFilter.Set;
        }
    }

}
