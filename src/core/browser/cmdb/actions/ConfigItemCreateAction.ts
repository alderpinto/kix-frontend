/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { ConfigItemDialogUtil } from '../ConfigItemDialogUtil';

export class ConfigItemCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('cmdb/configitems', [CRUD.CREATE]),
        new UIComponentPermission('system/cmdb/classes', [CRUD.READ])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Config Item';
        this.icon = 'kix-icon-new-ci';
    }

    public async run(event: any): Promise<void> {
        ConfigItemDialogUtil.create();
    }

}
