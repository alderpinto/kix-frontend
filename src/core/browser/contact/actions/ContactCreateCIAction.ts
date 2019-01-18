import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class ContactCreateCIAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neues Config Item";
        this.icon = "kix-icon-cmdb";
    }

}
