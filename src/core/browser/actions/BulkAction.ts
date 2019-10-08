/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../model/components/action/AbstractAction';
import { ContextMode, KIXObjectType, KIXObject } from '../../model';
import { ContextService } from '../context';
import { BulkDialogContext, BulkService } from '../bulk';
import { EventService, IEventSubscriber } from '../event';
import { IdService } from '../IdService';
import { ITable } from '../table';
import { DialogEvents, DialogEventData } from '../components/dialog';

export class BulkAction extends AbstractAction<ITable> implements IEventSubscriber {

    public hasLink: boolean = false;

    public eventSubscriberId: string;
    public objectType: KIXObjectType;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Bulk Action';
        this.icon = 'kix-icon-arrow-collect';
        this.eventSubscriberId = IdService.generateDateBasedId('bulk-action-');
    }

    public canRun(): boolean {
        let canRun = false;
        if (this.data) {
            const rows = this.data.getSelectedRows();
            canRun = rows && rows.length > 0;
        }

        return canRun;
    }

    public canShow(): boolean {
        return BulkService.getInstance().hasBulkManager(this.data.getObjectType());
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const rows = this.data.getSelectedRows();
            const objects = rows.map((r) => r.getRowObject().getObject());
            this.objectType = this.data.getObjectType();
            if (BulkService.getInstance().hasBulkManager(this.objectType)) {
                await this.openDialog(objects);
            } else {
                super.run(event);
            }
        }
    }

    private async openDialog(selectedObjects: KIXObject[]): Promise<void> {
        const context = await ContextService.getInstance().getContext<BulkDialogContext>(
            BulkDialogContext.CONTEXT_ID
        );

        if (context) {
            context.setObjectList(this.objectType, selectedObjects);
        }

        context.setDialogSubscriberId(this.eventSubscriberId);
        EventService.getInstance().subscribe(DialogEvents.DIALOG_CANCELED, this);
        EventService.getInstance().subscribe(DialogEvents.DIALOG_FINISHED, this);

        ContextService.getInstance().setDialogContext(BulkDialogContext.CONTEXT_ID, null, ContextMode.EDIT_BULK);
    }

    public async eventPublished(data: DialogEventData, eventId: string, subscriberId: string): Promise<void> {
        if (data && data.dialogId === 'bulk-dialog' && subscriberId === this.eventSubscriberId) {
            EventService.getInstance().unsubscribe(DialogEvents.DIALOG_CANCELED, this);
            EventService.getInstance().unsubscribe(DialogEvents.DIALOG_FINISHED, this);

            if (eventId === DialogEvents.DIALOG_FINISHED) {
                this.data.selectNone();
            }

            let selectedObjects: KIXObject[];
            if (eventId === DialogEvents.DIALOG_CANCELED) {
                selectedObjects = this.data.getSelectedRows().map((r) => r.getRowObject().getObject());
            }

            const bulkManager = BulkService.getInstance().getBulkManager(this.objectType);
            if (bulkManager && bulkManager.getBulkRunState()) {
                await this.data.reload();
                if (selectedObjects && selectedObjects.length) {
                    selectedObjects.forEach((o) => this.data.selectRowByObject(o));
                }
            }
        }
    }
}
