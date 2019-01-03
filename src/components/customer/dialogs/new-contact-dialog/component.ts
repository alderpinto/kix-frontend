import { ComponentState } from "./ComponentState";
import {
    DialogService, ContextService, FormService, OverlayService, ServiceRegistry
} from "../../../../core/browser";
import {
    OverlayType, StringContent, ComponentContent,
    ValidationSeverity, ValidationResult, ContextMode, KIXObjectType, ToastContent, ContactProperty
} from "../../../../core/model";
import { ContactService, ContactDetailsContext } from "../../../../core/browser/contact";
import { RoutingService, RoutingConfiguration } from "../../../../core/browser/router";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.loading = true;
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
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
            DialogService.getInstance().setMainDialogLoading(true, "Ansprechpartner wird angelegt");
            const service
                = ServiceRegistry.getInstance().getServiceInstance<ContactService>(KIXObjectType.CONTACT);
            await service.createObjectByForm(KIXObjectType.CONTACT, this.state.formId)
                .then((contactId) => {
                    DialogService.getInstance().setMainDialogLoading();
                    this.showSuccessHint();
                    DialogService.getInstance().closeMainDialog();
                    const routingConfiguration = new RoutingConfiguration(
                        null, ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
                        ContextMode.DETAILS, ContactProperty.ContactID, true
                    );
                    RoutingService.getInstance().routeToContext(routingConfiguration, contactId);
                }).catch((error) => {
                    DialogService.getInstance().setMainDialogLoading();
                    this.showError(error);
                });
        }
    }

    private showSuccessHint(): void {
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-check', 'Ansprechpartner wurde erfolgreich angelegt.')
        );
        OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
    }

    private showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Fehler beim Validieren des Formulars:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Validierungsfehler', true
        );
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }
}

module.exports = Component;
