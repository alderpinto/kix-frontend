/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class TicketStateType extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_STATE_TYPE;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public constructor(state?: TicketStateType) {
        super();
        if (state) {
            this.ID = Number(state.ID);
            this.ObjectId = this.ID;
            this.Name = state.Name;
        }

        this.ValidID = 1;
    }

    public equals(state: TicketStateType): boolean {
        return this.ID === state.ID;
    }

}
