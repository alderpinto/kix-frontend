/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { DialogService } from "../../../../../modules/base-components/webapp/core/DialogService";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { FormService } from "../../../../../modules/base-components/webapp/core/FormService";
import { ValidationSeverity } from "../../../../../modules/base-components/webapp/core/ValidationSeverity";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { ContextType } from "../../../../../model/ContextType";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { BrowserUtil } from "../../../../../modules/base-components/webapp/core/BrowserUtil";
import { ValidationResult } from "../../../../../modules/base-components/webapp/core/ValidationResult";
import { ComponentContent } from "../../../../../modules/base-components/webapp/core/ComponentContent";
import { OverlayService } from "../../../../../modules/base-components/webapp/core/OverlayService";
import { OverlayType } from "../../../../../modules/base-components/webapp/core/OverlayType";
import { Error } from "../../../../../../../server/model/Error";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.loading = true;
        DialogService.getInstance().setMainDialogHint('Translatable#All form fields marked by * are required fields.');

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
    }

    public async cancel(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            this.showValidationError(result);
        } else {
            DialogService.getInstance().setMainDialogLoading(true, 'Translatable#Update Contact');
            const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
            if (context) {
                await KIXObjectService.updateObjectByForm(
                    KIXObjectType.CONTACT, this.state.formId, context.getObjectId()
                ).then(async (contactId) => {
                    context.getObject(KIXObjectType.CONTACT, true);
                    DialogService.getInstance().setMainDialogLoading(false);

                    const toast = await TranslationService.translate('Translatable#Changes saved.');
                    BrowserUtil.openSuccessOverlay(toast);
                    DialogService.getInstance().submitMainDialog();
                }).catch((error: Error) => {
                    DialogService.getInstance().setMainDialogLoading();
                    BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                });
            }
        }
    }

    private showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Translatable#Error on form validation:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Translatable#Validation error', null, true
        );
    }

}

module.exports = Component;
