/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../model';
import { ContextService } from '../../context';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class MailAccountCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/communication/mailaccounts', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Email Account';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.MAIL_ACCOUNT, ContextMode.CREATE_ADMIN, null, true,
            'Translatable#Communication: Email'
        );
    }

}
