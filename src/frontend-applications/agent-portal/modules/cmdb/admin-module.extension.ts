/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAdminModuleExtension } from "../admin/server/IAdminModuleExtension";
import { AdminModuleCategory } from "../admin/model/AdminModuleCategory";
import { AdminModule } from "../admin/model/AdminModule";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { CRUD } from "../../../../server/model/rest/CRUD";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'cmdb', 'Translatable#Assets', null, [],
                [
                    new AdminModule(
                        null, 'cmdb-classes', 'Translatable#CI Classes', null,
                        KIXObjectType.CONFIG_ITEM_CLASS, 'cmdb-admin-ci-classes',
                        [
                            new UIComponentPermission('system/cmdb/classes', [CRUD.CREATE], true),
                            new UIComponentPermission('system/cmdb/classes/*', [CRUD.UPDATE], true)
                        ]
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
