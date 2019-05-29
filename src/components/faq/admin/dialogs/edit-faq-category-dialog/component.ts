import {
    OverlayService, FormService, AbstractMarkoComponent, KIXObjectService, ContextService, BrowserUtil
} from '../../../../../core/browser';
import {
    ValidationSeverity, OverlayType, ComponentContent, ValidationResult, KIXObjectType, Error
} from '../../../../../core/model';
import { ComponentState } from './ComponentState';
import { TicketPriorityDetailsContext } from '../../../../../core/browser/ticket';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../../core/browser/components/dialog';
import { FAQCategoryDetailsContext } from '../../../../../core/browser/faq/admin';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint('Translatable#All form fields marked by * are required fields.');

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
    }

    public async cancel(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        setTimeout(async () => {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            const result = await formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
            if (validationError) {
                this.showValidationError(result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, 'Translatable#Update FAQ Category');

                const context = await ContextService.getInstance().getContext<FAQCategoryDetailsContext>(
                    FAQCategoryDetailsContext.CONTEXT_ID
                );

                await KIXObjectService.updateObjectByForm(
                    KIXObjectType.FAQ_CATEGORY, this.state.formId, context.getObjectId()
                ).then(async (categoryId) => {
                    context.getObject(KIXObjectType.FAQ_CATEGORY, true);
                    DialogService.getInstance().setMainDialogLoading(false);

                    const toast = await TranslationService.translate('Translatable#Changes saved.');
                    BrowserUtil.openSuccessOverlay(toast);
                    DialogService.getInstance().submitMainDialog();
                }).catch((error: Error) => {
                    DialogService.getInstance().setMainDialogLoading(false);
                    BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                });
            }
        }, 300);
    }


    public showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Translatable#Error on form validation:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Translatable#Validation error', true
        );
    }

}

module.exports = Component;