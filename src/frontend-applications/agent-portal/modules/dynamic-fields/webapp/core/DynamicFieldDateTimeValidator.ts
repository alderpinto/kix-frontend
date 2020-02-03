/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { TranslationService } from "../../../translation/webapp/core/TranslationService";
import { IFormFieldValidator } from "../../../base-components/webapp/core/IFormFieldValidator";
import { ValidationResult } from "../../../base-components/webapp/core/ValidationResult";
import { FormService } from "../../../base-components/webapp/core/FormService";
import { ValidationSeverity } from "../../../base-components/webapp/core/ValidationSeverity";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { DynamicFormFieldOption } from "./DynamicFormFieldOption";
import { DynamicField } from "../../model/DynamicField";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { DynamicFieldProperty } from "../../model/DynamicFieldProperty";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";

export class DynamicFieldDateTimeValidator implements IFormFieldValidator {

    public validatorId: string = 'DynamicFieldDateTimeValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === KIXObjectProperty.DYNAMIC_FIELDS;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const value = formInstance.getFormFieldValue(formField.instanceId);
        const fieldValue = value ? value.value : null;
        if (fieldValue && fieldValue instanceof Date) {
            const nameOption = formField.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);

            if (nameOption) {
                const dynamicField = await this.getDynamicField(nameOption.value);
                return await this.checkDynamicField(dynamicField, fieldValue, formField.label);
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private async getDynamicField(name: string): Promise<DynamicField> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    DynamicFieldProperty.NAME, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, name
                )
            ], null, null, [DynamicFieldProperty.CONFIG]
        );
        const fields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
        );

        const dynamicField = fields && fields.length ? fields[0] : null;

        return dynamicField && (dynamicField.FieldType === 'Date' || dynamicField.FieldType === 'DateTime')
            ? dynamicField
            : null;
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return dynamicField.FieldType === 'Date' || dynamicField.FieldType === 'DateTime';
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return await this.checkDynamicField(dynamicField, value, dynamicField.Label);
    }

    private async checkDynamicField(dynamicField: DynamicField, value: Date, label: string): Promise<ValidationResult> {
        if (dynamicField && value) {
            if (typeof value === 'string') {
                value = new Date(value);
            }

            if (dynamicField.Config.DateRestriction) {
                const restricition = dynamicField.Config.DateRestriction;
                const currentTime = new Date();

                if (dynamicField.FieldType === 'Date') {
                    currentTime.setHours(0, 0, 0, 0);
                }

                if (restricition === 'DisableFutureDates' && value > currentTime) {
                    const fieldLabel = await TranslationService.translate(label);
                    const errorMessage = await TranslationService.translate(
                        // tslint:disable-next-line:max-line-length
                        'Translatable#The value for the field is in the future! The date needs to be in the past!'
                    );
                    const errorString = await TranslationService.translate(
                        "Translatable#Field '{0}' has an invalid value ({1}).", [fieldLabel, errorMessage]
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                } else if (restricition === 'DisablePastDates' && value < currentTime) {
                    const fieldLabel = await TranslationService.translate(label);
                    const errorMessage = await TranslationService.translate(
                        // tslint:disable-next-line:max-line-length
                        'The value for the field is in the past! The date needs to be in the future!'
                    );
                    const errorString = await TranslationService.translate(
                        "Translatable#Field '{0}' has an invalid value ({1}).", [fieldLabel, errorMessage]
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                }

                const currentYear = currentTime.getFullYear();
                const selectedYear = value.getFullYear();

                const yearsInPast = Number(dynamicField.Config.YearsInPast);
                if (yearsInPast && yearsInPast > 0) {
                    if ((currentYear - yearsInPast) > selectedYear) {
                        const fieldLabel = await TranslationService.translate(label);
                        const errorMessage = await TranslationService.translate(
                            // tslint:disable-next-line:max-line-length
                            'Translatable#The year can be a maximum of {0} years in the past', [yearsInPast]
                        );
                        const errorString = await TranslationService.translate(
                            "Translatable#Field '{0}' has an invalid value ({1}).", [fieldLabel, errorMessage]
                        );
                        return new ValidationResult(ValidationSeverity.ERROR, errorString);
                    }
                }

                const yearsInFuture = Number(dynamicField.Config.YearsInFuture);
                if (yearsInFuture && yearsInFuture > 0) {
                    if ((currentYear + yearsInFuture) < selectedYear) {
                        const fieldLabel = await TranslationService.translate(label);
                        const errorMessage = await TranslationService.translate(
                            // tslint:disable-next-line:max-line-length
                            'Translatable#The year can be a maximum of {0} years in the future', [yearsInPast]
                        );
                        const errorString = await TranslationService.translate(
                            "Translatable#Field '{0}' has an invalid value ({1}).", [fieldLabel, errorMessage]
                        );
                        return new ValidationResult(ValidationSeverity.ERROR, errorString);
                    }
                }
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
