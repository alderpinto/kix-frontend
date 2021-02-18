/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { DialogService } from '../../../../../modules/base-components/webapp/core/DialogService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { ValidationSeverity } from '../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TicketPriorityDetailsContext } from '../../core';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { ValidationResult } from '../../../../../modules/base-components/webapp/core/ValidationResult';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { Error } from '../../../../../../../server/model/Error';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        // tslint:disable-next-line:max-line-length
        DialogService.getInstance().setMainDialogHint('Translatable#For keyboard navigation, press Ctrl to switch focus to dialog. See manual for more detailed information.');

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Save'
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
                BrowserUtil.toggleLoadingShield(true, 'Translatable#Update Priority');

                const context = await ContextService.getInstance().getContext<TicketPriorityDetailsContext>(
                    TicketPriorityDetailsContext.CONTEXT_ID
                );

                await KIXObjectService.updateObjectByForm(
                    KIXObjectType.TICKET_PRIORITY, this.state.formId, context.getObjectId()
                ).then(async (priorityId) => {
                    context.getObject(KIXObjectType.TICKET_PRIORITY, true);
                    BrowserUtil.toggleLoadingShield(false);

                    const toast = await TranslationService.translate('Translatable#Changes saved.');
                    BrowserUtil.openSuccessOverlay(toast);
                    DialogService.getInstance().submitMainDialog();
                }).catch((error: Error) => {
                    BrowserUtil.toggleLoadingShield(false);
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
            OverlayType.WARNING, null, content, 'Translatable#Validation error', null, true
        );
    }

}

module.exports = Component;
