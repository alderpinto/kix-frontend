/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    FormService, ServiceRegistry, ServiceType, OverlayService, BrowserUtil, ContextService
} from '../../../../core/browser';
import {
    KIXObjectType, FormField, FormFieldValue, PersonalSetting, Form, FormContext,
    ValidationSeverity, OverlayType, ComponentContent, ValidationResult, Error
} from '../../../../core/model';
import { FormGroup } from '../../../../core/model/components/form/FormGroup';
import { ApplicationEvent } from '../../../../core/browser/application';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../core/browser/components/dialog';
import { EventService } from '../../../../core/browser/event';
import { AgentService } from '../../../../core/browser/application/AgentService';


class Component {

    private state: ComponentState;

    public async onCreate(input: any): Promise<void> {
        this.state = new ComponentState(input.instanceId);
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject(
            ["Translatable#Cancel", "Translatable#Save"]
        );

        const form = await this.prepareForm();
        await FormService.getInstance().addForm(form);
        this.state.formId = form.id;
        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        if (this.state.formId) {
            FormService.getInstance().deleteFormInstance(this.state.formId);
        }
    }

    private async prepareForm(): Promise<Form> {
        const personalSettings: PersonalSetting[] = await AgentService.getInstance().getPersonalSettings();

        const formGroups: FormGroup[] = [];
        personalSettings.forEach((ps) => {
            const group = formGroups.find((g) => g.name === ps.group);
            const formField = new FormField(
                ps.label, ps.property, ps.inputType, false, ps.hint, ps.options, new FormFieldValue(ps.defaultValue)
            );
            if (group) {
                group.formFields.push(formField);
            } else {
                formGroups.push(new FormGroup(ps.group, [formField]));
            }
        });

        const formName = await TranslationService.translate('Translatable#Personal Settings');
        return new Form(
            'personal-settings', formName,
            formGroups, KIXObjectType.PERSONAL_SETTINGS, true, FormContext.EDIT,
            null, null, true
        );
    }

    public async cancel(): Promise<void> {
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        if (this.state.formId) {
            setTimeout(async () => {
                const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
                const result = await formInstance.validateForm();
                const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
                if (validationError) {
                    this.showValidationError(result);
                } else {
                    const loadingHint = await TranslationService.translate('Translatable#Save Settings.');
                    DialogService.getInstance().setMainDialogLoading(true, loadingHint);
                    await AgentService.getInstance().setPreferencesByForm(this.state.formId)
                        .then(async () => {
                            DialogService.getInstance().setMainDialogLoading(false);
                            DialogService.getInstance().submitMainDialog();
                            EventService.getInstance().publish(ApplicationEvent.REFRESH);
                            const toast = await TranslationService.translate('Translatable#Changes saved.');
                            BrowserUtil.openSuccessOverlay(toast);
                        }).catch((error: Error) => {
                            DialogService.getInstance().setMainDialogLoading(false);
                            BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                        });
                }
            });
        }
    }

    public async showValidationError(result: ValidationResult[]): Promise<void> {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);

        const title = await TranslationService.translate('Translatable#Error on form validation:');

        const content = new ComponentContent('list-with-title',
            {
                title,
                list: errorMessages
            }
        );

        const toastTitle = await TranslationService.translate('Translatable#Validation error');

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, toastTitle, true
        );
    }
}

module.exports = Component;
