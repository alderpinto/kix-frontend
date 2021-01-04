/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';

export interface IObjectReferenceHandler {

    name: string;

    objectType: KIXObjectType;

    determineObjects(object: KIXObject, config: any): Promise<KIXObject[]>;

    determineObjectsByForm(formId: string, object: KIXObject, config: any): Promise<KIXObject[]>;

    isPossibleFormField(formField: FormFieldConfiguration, config: any): boolean;

}
