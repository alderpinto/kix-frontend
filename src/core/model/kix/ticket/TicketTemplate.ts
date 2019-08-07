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

export class TicketTemplate extends KIXObject<TicketTemplate> {

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_TEMPLATE;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public TypeID: number;

    public ChannelID: number;

    public Comment: string;

    public ChangeTime: string;

    public ChangeBy: number;

    public CreateTime: string;

    public CreateBy: number;

    public ValidID: number;

    public constructor(template?: TicketTemplate) {
        super();
        if (template) {
            this.ID = Number(template.ID);
            this.ObjectId = this.ID;
            this.Name = template.Name;
            this.TypeID = template.TypeID;
            this.ChannelID = template.ChannelID;
            this.Comment = template.Comment;
            this.ChangeTime = template.ChangeTime;
            this.ChangeBy = template.ChangeBy;
            this.CreateTime = template.CreateTime;
            this.CreateBy = template.CreateBy;
            this.ValidID = template.ValidID;
        }
    }

    public equals(template: TicketTemplate): boolean {
        return this.ID === template.ID;
    }

}
