/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from "../../../../../modules/base-components/webapp/core/AbstractAction";
import { Ticket } from "../../../model/Ticket";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../../server/model/rest/CRUD";
import { EventService } from "../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { TicketProperty } from "../../../model/TicketProperty";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { TicketDetailsContext } from "..";
import { BrowserUtil } from "../../../../../modules/base-components/webapp/core/BrowserUtil";
import { BrowserCacheService } from "../../../../../modules/base-components/webapp/core/CacheService";

export class TicketLockAction extends AbstractAction<Ticket> {

    public hasLink: boolean = false;

    public permissions = [
        new UIComponentPermission('tickets/*', [CRUD.UPDATE])
    ];

    private currentLockId: number;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Lock';
        this.icon = 'kix-icon-lock-close';
    }

    public async setData(ticket: Ticket): Promise<void> {
        this.data = ticket;

        this.text = ticket.LockID === 1 ? 'Translatable#Lock' : 'Translatable#Unlock';
        this.icon = ticket.LockID === 1 ? 'kix-icon-lock-close' : 'kix-icon-lock-open';
        this.currentLockId = ticket.LockID;
    }

    public async canShow(): Promise<boolean> {
        return this.data && this.data.OwnerID !== 1;
    }

    public async run(): Promise<void> {
        let successHint = 'Translatable#Ticket locked.';

        let newLockId = 1;
        if (this.currentLockId === 1) {
            newLockId = 2;
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Lock Ticket' }
            );
        } else {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Unlock Ticket' }
            );
            successHint = 'Translatable#Ticket unlocked.';
        }

        await KIXObjectService.updateObject(
            KIXObjectType.TICKET, [[TicketProperty.LOCK_ID, newLockId]], this.data.TicketID,
        ).catch((error) => null);

        setTimeout(async () => {
            const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
            await context.getObject(KIXObjectType.TICKET, true);
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
            BrowserUtil.openSuccessOverlay(successHint);

            BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
            EventService.getInstance().publish(ApplicationEvent.REFRESH);
        }, 500);
    }

}