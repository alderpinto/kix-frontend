/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { ObjectIcon } from '../../icon/model/ObjectIcon';

export class AdminModule {

    public constructor(
        adminModule?: AdminModule,
        public id?: string,
        public name?: string,
        public icon?: string | ObjectIcon,
        public objectType?: KIXObjectType | string,
        public componentId?: string,
        public permissions: UIComponentPermission[] = []
    ) {
        if (adminModule) {
            this.id = adminModule.id;
            this.name = adminModule.name;
            this.icon = adminModule.icon;
            this.objectType = adminModule.objectType;
            this.componentId = adminModule.componentId;
        }
    }

}
