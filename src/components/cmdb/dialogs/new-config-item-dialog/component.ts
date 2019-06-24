import { OverlayService, FormService, ServiceRegistry, BrowserUtil } from '../../../../core/browser';
import {
    ComponentContent, OverlayType, TreeNode, ValidationResult,
    ValidationSeverity, ConfigItemClass, KIXObjectType, ContextMode, ConfigItemProperty, Error
} from '../../../../core/model';
import { ComponentState } from './ComponentState';
import { CMDBService, ConfigItemDetailsContext, ConfigItemFormFactory } from '../../../../core/browser/cmdb';
import { RoutingService, RoutingConfiguration } from '../../../../core/browser/router';
import { DialogService } from '../../../../core/browser/components/dialog';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Config Item Class", "Translatable#Save"
        ]);

        this.state.placeholder = await TranslationService.translate("Translatable#Select Config Item Class");
        this.state.classNodes = await CMDBService.getInstance().getTreeNodes(ConfigItemProperty.CLASS_ID);
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
    }

    public async cancel(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
        DialogService.getInstance().closeMainDialog();
    }

    public async classChanged(nodes: TreeNode[]): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true);
        this.state.currentClassNode = nodes && nodes.length ? nodes[0] : null;
        FormService.getInstance().deleteFormInstance(this.state.formId);
        this.state.formId = null;
        let formId;
        if (this.state.currentClassNode) {
            const ciClass = this.state.currentClassNode.id as ConfigItemClass;
            formId = ConfigItemFormFactory.getInstance().getFormId(ciClass);
        } else {
            formId = null;
        }

        setTimeout(() => {
            this.state.formId = formId;
            DialogService.getInstance().setMainDialogLoading(false);
        }, 100);
    }

    public async submit(): Promise<void> {
        if (this.state.formId) {

            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            const result = await formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);

            if (validationError) {
                this.showValidationError(result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, 'Translatable#Create Config Item');
                const cmdbService
                    = ServiceRegistry.getServiceInstance<CMDBService>(KIXObjectType.CONFIG_ITEM);

                const ciClass = this.state.currentClassNode.id as ConfigItemClass;
                await cmdbService.createConfigItem(this.state.formId, ciClass.ID)
                    .then((configItemId) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        BrowserUtil.openSuccessOverlay('Translatable#Config Item successfully created.');
                        DialogService.getInstance().submitMainDialog();
                        const routingConfiguration = new RoutingConfiguration(
                            ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM,
                            ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID, true
                        );
                        RoutingService.getInstance().routeToContext(routingConfiguration, configItemId);
                    }).catch((error: Error) => {
                        DialogService.getInstance().setMainDialogLoading(false);
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
            OverlayType.WARNING, null, content, 'Translatable#Validation error', true
        );
    }

}

module.exports = Component;
