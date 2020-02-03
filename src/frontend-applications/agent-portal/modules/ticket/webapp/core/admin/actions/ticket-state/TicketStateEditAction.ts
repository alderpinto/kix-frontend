/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from "../../../../../../../modules/base-components/webapp/core/AbstractAction";
import { UIComponentPermission } from "../../../../../../../model/UIComponentPermission";
import { CRUD } from "../../../../../../../../../server/model/rest/CRUD";
import { ContextService } from "../../../../../../../modules/base-components/webapp/core/ContextService";
import { TicketStateDetailsContext, EditTicketStateDialogContext } from "../..";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { ContextMode } from "../../../../../../../model/ContextMode";

export class TicketStateEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/ticket/states/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketStateDetailsContext>(
            TicketStateDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditTicketStateDialogContext.CONTEXT_ID, KIXObjectType.TICKET_STATE,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
