/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CompareConfigItemVersionDialogContext } from '../context';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { Table } from '../../../../base-components/webapp/core/table';
import { Version } from '../../../model/Version';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

export class ConfigItemVersionCompareAction extends AbstractAction<Table> {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Compare';
        this.icon = 'kix-icon-comparison-version';
    }

    public canRun(): boolean {
        let canRun = false;
        if (this.data && this.data instanceof Table) {
            const rows = this.data.getSelectedRows();
            canRun = rows && rows.length > 1;
        }

        return canRun;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const rows = this.data.getSelectedRows();
            const objects = rows.map((r) => r.getRowObject().getObject());
            await this.openDialog(objects);
        }
    }

    private async openDialog(versions: Version[]): Promise<void> {
        let context = ContextService.getInstance().getActiveContext();

        await ContextService.getInstance().setActiveContext(
            CompareConfigItemVersionDialogContext.CONTEXT_ID, context?.getObjectId()
        );

        context = ContextService.getInstance().getActiveContext();
        context?.setObjectList(KIXObjectType.CONFIG_ITEM_VERSION, versions);
    }
}
