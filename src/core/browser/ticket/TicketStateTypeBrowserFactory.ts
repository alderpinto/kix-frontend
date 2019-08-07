/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketStateType } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class TicketStateTypeBrowserFactory implements IKIXObjectFactory<TicketStateType> {

    private static INSTANCE: TicketStateTypeBrowserFactory;

    public static getInstance(): TicketStateTypeBrowserFactory {
        if (!TicketStateTypeBrowserFactory.INSTANCE) {
            TicketStateTypeBrowserFactory.INSTANCE = new TicketStateTypeBrowserFactory();
        }
        return TicketStateTypeBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(stateType: TicketStateType): Promise<TicketStateType> {
        return new TicketStateType(stateType);
    }

}
