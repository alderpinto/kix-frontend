import { KIXObjectType } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { AbstractNewDialog } from "../../../../../core/browser/components/dialog";

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Notification',
            'Translatable#Notification successfully created.',
            KIXObjectType.NOTIFICATION,
            null
            // new RoutingConfiguration(
            //     MailAccountDetailsContext.CONTEXT_ID, KIXObjectType.NOTIFICATION,
            //     ContextMode.DETAILS, NotificationProperty.ID, true
            // )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
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
