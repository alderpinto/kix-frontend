import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class OrganisationCreateContactAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Contact';
        this.icon = 'kix-icon-man-bubble-new';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.CONTACT, ContextMode.CREATE, null, true,
            undefined, undefined, 'new-contact-form'
        );
    }

}
