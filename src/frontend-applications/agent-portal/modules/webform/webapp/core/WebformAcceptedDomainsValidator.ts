/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator } from '../../../base-components/webapp/core/IFormFieldValidator';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { FormService } from '../../../base-components/webapp/core/FormService';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { WebformProperty } from '../../model/WebformProperty';
import { Webform } from '../../model/Webform';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class WebformAcceptedDomainsValidator implements IFormFieldValidator {

    public validatorId: string = 'WebformAcceptedDomainsValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === WebformProperty.ACCEPTED_DOMAINS;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {

        if (formField.property === WebformProperty.ACCEPTED_DOMAINS) {
            const formInstance = await FormService.getInstance().getFormInstance(formId);
            const value = formInstance.getFormFieldValue<string>(formField.instanceId);
            if (value && value.value && !value.value.match(/^(\*|\.\*|\.\+)$/)) {
                const domains = Webform.getDomains(value.value, false);
                if (domains.length) {
                    for (const domain of domains) {
                        if (domain && domain.match(/^\/.+\/$/)) {
                            const error = Webform.checkRegEx(domain);
                            if (error) {
                                return new ValidationResult(ValidationSeverity.ERROR, error.message);
                            }
                        }
                    }
                } else {
                    const fieldLabel = await TranslationService.translate(formField.label);
                    const errorString = await TranslationService.translate(
                        'Translatable#Required field {0} has no usable value.', [fieldLabel]
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                }
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return false;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
