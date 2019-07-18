/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../kix";
import { KIXObjectType } from "../../model";

export class SearchService extends KIXObjectService<any> {

    private static INSTANCE: SearchService;

    public static getInstance(): SearchService {
        if (!SearchService.INSTANCE) {
            SearchService.INSTANCE = new SearchService();
        }
        return SearchService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return false;
    }

    public getLinkObjectName(): string {
        return null;
    }
}
