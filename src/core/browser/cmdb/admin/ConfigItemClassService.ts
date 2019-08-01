/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../../kix";
import { KIXObjectType, ConfigItemClass } from "../../../model";

export class ConfigItemClassService extends KIXObjectService<ConfigItemClass> {

    private static INSTANCE: ConfigItemClassService = null;

    public static getInstance(): ConfigItemClassService {
        if (!ConfigItemClassService.INSTANCE) {
            ConfigItemClassService.INSTANCE = new ConfigItemClassService();
        }

        return ConfigItemClassService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS;
    }

    public getLinkObjectName(): string {
        return 'ConfigItemClass';
    }

}
