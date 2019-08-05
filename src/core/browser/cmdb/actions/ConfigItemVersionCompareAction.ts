/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction, Version, ContextMode, KIXObjectType } from '../../../model';
import { ITable, Table } from '../../table';
import { ContextService } from '../../context';
import { CompareConfigItemVersionDialogContext } from '../context';

export class ConfigItemVersionCompareAction extends AbstractAction<ITable> {

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
        const context = await ContextService.getInstance().getContext<CompareConfigItemVersionDialogContext>(
            CompareConfigItemVersionDialogContext.CONTEXT_ID
        );

        if (context) {
            context.setObjectList(versions);
        }

        ContextService.getInstance().setDialogContext(
            CompareConfigItemVersionDialogContext.CONTEXT_ID,
            KIXObjectType.CONFIG_ITEM_VERSION_COMPARE,
            ContextMode.EDIT
        );
    }
}
