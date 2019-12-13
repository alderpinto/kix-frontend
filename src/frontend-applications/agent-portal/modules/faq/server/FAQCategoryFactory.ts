/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from "../../../server/model/ObjectFactory";
import { FAQCategory } from "../model/FAQCategory";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";


export class FAQCategoryFactory extends ObjectFactory<FAQCategory> {

    public isFactoryFor(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.FAQ_CATEGORY;
    }

    public async create(category?: FAQCategory): Promise<FAQCategory> {
        return new FAQCategory(category);
    }

}