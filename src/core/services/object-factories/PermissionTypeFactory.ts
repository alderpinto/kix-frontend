/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PermissionType, KIXObjectType } from "../../model";
import { ObjectFactory } from "./ObjectFactory";

export class PermissionTypeFactory extends ObjectFactory<PermissionType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.PERMISSION_TYPE;
    }

    public create(permissionType?: PermissionType): PermissionType {
        return new PermissionType(permissionType);
    }

}
