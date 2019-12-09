/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    FormService, ContextService, OverlayService, ServiceRegistry, BrowserUtil
} from '../../../../core/browser';
import {
    ValidationSeverity, ContextType, ValidationResult, ComponentContent,
    OverlayType, KIXObjectType, StringContent, ConfigItem, ConfigItemProperty
} from '../../../../core/model';
import { ComponentState } from './ComponentState';
import { CMDBService } from '../../../../core/browser/cmdb';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../core/browser/components/dialog';

class Component {

    private state: ComponentState;

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
            if (formInstance) {
                const result = await formInstance.validateForm();
                const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
                if (validationError) {
                    this.showValidationError(result);
                } else {
                    DialogService.getInstance().setMainDialogLoading(true, 'Translatable#Update Config Item');
                    const cmdbService = ServiceRegistry.getServiceInstance<CMDBService>(KIXObjectType.CONFIG_ITEM);
                    const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
                    if (cmdbService && context) {
                        const configItem = await context.getObject<ConfigItem>(KIXObjectType.CONFIG_ITEM, true);
                        const versionId = await cmdbService.createConfigItemVersion(
                            this.state.formId, Number(context.getObjectId())
                        );
                        DialogService.getInstance().setMainDialogLoading(false);
                        if (versionId) {
                            const updatedConfigItem = await context.getObject<ConfigItem>(
                                KIXObjectType.CONFIG_ITEM, true,
                                [ConfigItemProperty.VERSIONS, ConfigItemProperty.CURRENT_VERSION]
                            );

                            const toast = await TranslationService.translate('Translatable#Changes saved.');

                            const hint = configItem.CurrentVersion
                                && configItem.CurrentVersion.equals(updatedConfigItem.CurrentVersion)
                                ? toast : 'Translatable#New Version created';
                            BrowserUtil.openSuccessOverlay(hint);

                            DialogService.getInstance().submitMainDialog();
                        }
                    }
                }
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

    public showError(error: any): void {
        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, new StringContent(error), 'Translatable#Error!', true
        );
    }

}

module.exports = Component;
