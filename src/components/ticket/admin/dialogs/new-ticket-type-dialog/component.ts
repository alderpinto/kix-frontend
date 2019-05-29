import { KIXObjectType, ContextMode, TicketTypeProperty } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { TicketTypeDetailsContext } from "../../../../../core/browser/ticket";
import { RoutingConfiguration } from "../../../../../core/browser/router";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Type',
            'Translatable#Type successfully created.',
            KIXObjectType.TICKET_TYPE,
            new RoutingConfiguration(
                 TicketTypeDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_TYPE,
                ContextMode.DETAILS, TicketTypeProperty.ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

}

module.exports = Component;
