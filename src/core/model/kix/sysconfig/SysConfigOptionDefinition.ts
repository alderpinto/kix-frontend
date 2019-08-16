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

export class SysConfigOptionDefinition extends KIXObject<SysConfigOptionDefinition> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;

    public Name: string;

    public Value: any;

    public Default: any;

    public Description: string;

    public Group: string;

    public IsModified: number;

    public IsRequired: number;

    public Level: number;

    public Setting: any;

    public Type: string;


    public constructor(sysConfigOptionDefinition?: SysConfigOptionDefinition) {
        super(sysConfigOptionDefinition);
        if (sysConfigOptionDefinition) {
            this.Name = sysConfigOptionDefinition.Name;
            this.ObjectId = this.Name;
            this.Value = sysConfigOptionDefinition.Value;
            this.Default = sysConfigOptionDefinition.Default;
            this.Description = sysConfigOptionDefinition.Description;
            this.Group = sysConfigOptionDefinition.Group;
            this.IsModified = sysConfigOptionDefinition.IsModified;
            this.IsRequired = sysConfigOptionDefinition.IsRequired;
            this.Level = sysConfigOptionDefinition.Level;
            this.Setting = sysConfigOptionDefinition.Setting;
            this.Type = sysConfigOptionDefinition.Type;
        }
    }

    public equals(object: SysConfigOptionDefinition): boolean {
        return object.Name === this.Name;
    }

}
