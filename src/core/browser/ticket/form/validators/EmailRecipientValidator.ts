import {
    IFormFieldValidator, FormField, ValidationResult, ValidationSeverity,
    ArticleProperty, FormFieldValue, SystemAddress, KIXObjectType, ContextType, ContextMode, TicketProperty
} from "../../../../model";
import { FormService } from "../../..";
import { KIXObjectService } from "../../../kix";
import { ContextService } from "../../../context";
import { FormValidationService } from "../../../form";

export class EmailRecipientValidator implements IFormFieldValidator {

    public isValidatorFor(formField: FormField, formId: string): boolean {
        return formField.property === ArticleProperty.TO
            || formField.property === ArticleProperty.CC
            || formField.property === ArticleProperty.BCC
            || formField.property === ArticleProperty.BCC;
    }

    public async validate(formField: FormField, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        let toValue = await formInstance.getFormFieldValueByProperty<string>(ArticleProperty.TO);
        let checkToValue = true;
        if (!this.isDefined(toValue)) {
            const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
            if (context && context.getDescriptor().contextMode === ContextMode.CREATE) {
                toValue = await formInstance.getFormFieldValueByProperty<string>(TicketProperty.CONTACT_ID);
                checkToValue = false;
            }
        }

        const ccValue = await formInstance.getFormFieldValueByProperty<string>(ArticleProperty.CC);
        const bccValue = await formInstance.getFormFieldValueByProperty<string>(ArticleProperty.BCC);

        if (this.isDefined(toValue) || this.isDefined(ccValue) || this.isDefined(bccValue)) {
            let value;
            if (formField.property === ArticleProperty.TO) {
                value = toValue.value;
            } else if (formField.property === ArticleProperty.CC) {
                value = ccValue.value;
            } else if (formField.property === ArticleProperty.BCC) {
                value = bccValue.value;
            }

            if (formField.property !== ArticleProperty.TO || checkToValue) {
                const mailCheckResult = await this.checkEmail(value);
                if (mailCheckResult.severity === ValidationSeverity.ERROR) {
                    return mailCheckResult;
                }
            }
        } else {
            return new ValidationResult(
                ValidationSeverity.ERROR, 'Mindestens eines der Felder An, Cc oder Bcc muss eine Eingabe beinhalten.'
            );
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private isDefined(value: FormFieldValue): boolean {
        return value && value.value && !!value.value.length && value.value[0] !== '';
    }

    private async checkEmail(value: string[]): Promise<ValidationResult> {
        if (value && !!value.length) {
            const mailAddresses = value;
            for (const mail of mailAddresses) {
                const regex = new RegExp(FormValidationService.EMAIL_REGEX);
                if (!regex.test(mail.trim()) === true) {
                    return new ValidationResult(
                        ValidationSeverity.ERROR, FormValidationService.EMAIL_REGEX_ERROR_MESSAGE
                    );
                }

                if (await this.isSystemAddress(mail)) {
                    return new ValidationResult(
                        ValidationSeverity.ERROR, 'Translatable#Inserted email address must not be a system address.'
                    );
                }
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private async isSystemAddress(mail: string): Promise<boolean> {
        const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(KIXObjectType.SYSTEM_ADDRESS);
        if (systemAddresses) {
            return systemAddresses.some((sa) => sa.Name === mail);
        }

        return false;
    }

}
