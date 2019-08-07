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

export class TextModule extends KIXObject<TextModule> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public ID: number;

    public Name: string;

    public Text: string;

    public Keywords: string[];

    public Comment: string;

    public Subject: string;

    public Language: string;

    public equals(textModule: TextModule): boolean {
        return this.ID === textModule.ID;
    }

    public constructor(textModule?: TextModule) {
        super();
        if (textModule) {
            this.ID = textModule.ID;
            this.ObjectId = this.ID;
            this.Name = textModule.Name;
            this.Text = textModule.Text;
            this.Keywords = textModule.Keywords;
            this.Comment = textModule.Comment;
            this.Subject = textModule.Subject;
            this.Language = textModule.Language;
            this.ValidID = textModule.ValidID;
            this.CreateBy = textModule.CreateBy;
            this.CreateTime = textModule.CreateTime;
            this.ChangeBy = textModule.ChangeBy;
            this.ChangeTime = textModule.ChangeTime;
        }
    }

}
