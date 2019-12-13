/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from "../../../../base-components/webapp/core/FormInputComponentState";
import { PermissionManager } from "../../core/admin";
import { PermissionProperty } from "../../../model/PermissionProperty";

export class ComponentState extends FormInputComponentState<any[]> {

    public constructor(
        public permissionManager: PermissionManager = null,
        public createTitle: string = PermissionProperty.CREATE,
        public readTitle: string = PermissionProperty.READ,
        public updateTitle: string = PermissionProperty.UPDATE,
        public deleteTitle: string = PermissionProperty.DELETE,
        public denyTitle: string = PermissionProperty.DENY,
        public requiredTitle: string = PermissionProperty.IS_REQUIRED
    ) {
        super();
    }

}
