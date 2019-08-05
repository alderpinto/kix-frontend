/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from '../RequestObject';

export class CreateQueue extends RequestObject {

    public constructor(
        name: string, groupId?: number, comment?: string, followUpID?: number, defaultSignKey?: string,
        validID?: number, systemAddressID?: number, unlockTimeout?: number, calendar?: string,
        email?: string, salutationID?: number, realName?: string, followUpLock?: number,
        signatureID?: number, firstResponseTime?: number, firstResponseNotify?: number, updateTime?: number,
        updateNotify?: number, solutionTime?: number, solutionNotify?: number) {

        super();

        this.applyProperty("Name", name);
        this.applyProperty("GroupID", groupId);
        this.applyProperty("Comment", comment);
        this.applyProperty("FollowUpID", followUpID);
        this.applyProperty("DefaultSignKey", defaultSignKey);
        this.applyProperty("ValidID", validID);
        this.applyProperty("SystemAddressID", systemAddressID);
        this.applyProperty("UnlockTimeout", unlockTimeout);
        this.applyProperty("Calendar", calendar);
        this.applyProperty("Email", email);
        this.applyProperty("SalutationID", salutationID);
        this.applyProperty("RealName", realName);
        this.applyProperty("FollowUpLock", followUpLock);
        this.applyProperty("SignatureID", signatureID);
        this.applyProperty("FirstResponseTime", firstResponseTime);
        this.applyProperty("FirstResponseNotify", firstResponseNotify);
        this.applyProperty("UpdateTime", updateTime);
        this.applyProperty("UpdateNotify", updateNotify);
        this.applyProperty("SolutionTime", solutionTime);
        this.applyProperty("SolutionNotify", solutionNotify);
    }

}
