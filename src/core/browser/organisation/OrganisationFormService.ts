/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, Organisation } from "../../model";

export class OrganisationFormService extends KIXObjectFormService<Organisation> {

    private static INSTANCE: OrganisationFormService;

    public static getInstance(): OrganisationFormService {
        if (!OrganisationFormService.INSTANCE) {
            OrganisationFormService.INSTANCE = new OrganisationFormService();
        }
        return OrganisationFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.ORGANISATION;
    }

}
