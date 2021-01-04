/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../../model/Context';
import { LabelService } from '../../../../../../../modules/base-components/webapp/core/LabelService';
import { Queue } from '../../../../../model/Queue';
import { BreadcrumbInformation } from '../../../../../../../model/BreadcrumbInformation';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { AdminContext } from '../../../../../../admin/webapp/core';
import { KIXObject } from '../../../../../../../model/kix/KIXObject';

export class QueueDetailsContext extends Context {

    public static CONTEXT_ID = 'ticket-queue-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getObjectText(await this.getObject<Queue>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await LabelService.getInstance().getObjectName(KIXObjectType.QUEUE);
        const queue = await this.getObject<Queue>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${queue.Name}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.QUEUE, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadDetailsObject<O>(KIXObjectType.QUEUE);

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, objectType, changedProperties)
            );
        }

        return object;
    }

}
