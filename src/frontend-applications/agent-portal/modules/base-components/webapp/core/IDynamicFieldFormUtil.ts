/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { KIXObject } from "../../../../model/kix/KIXObject";
import { IKIXObjectFormService } from "./IKIXObjectFormService";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { ValidationResult } from "./ValidationResult";
import { CheckListItem } from "../../../dynamic-fields/webapp/core/CheckListItem";
import { DynamicField } from "../../../dynamic-fields/model/DynamicField";

export interface IDynamicFieldFormUtil {

    configureDynamicFields(form: FormConfiguration): Promise<void>;

    handleDynamicFieldValues(
        formFields: FormFieldConfiguration[], object: KIXObject, formService: IKIXObjectFormService
    ): Promise<void>;

    handleDynamicField(
        field: FormFieldConfiguration, value: FormFieldValue, parameter: Array<[string, any]>
    ): Promise<Array<[string, any]>>;

    validateDFValue(dfName: string, value: any): Promise<ValidationResult[]>;

    countValues(checklist: CheckListItem[]): [number, number];

    prepareDateField(field: FormFieldConfiguration, dynamicField: DynamicField): void;

    createDynamicFormField(field: FormFieldConfiguration): Promise<boolean>;

}