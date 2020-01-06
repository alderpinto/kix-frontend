/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../../../model/Context";
import { LabelService } from "../../../../../../../modules/base-components/webapp/core/LabelService";
import { TicketType } from "../../../../../model/TicketType";
import { BreadcrumbInformation } from "../../../../../../../model/BreadcrumbInformation";
import { TranslationService } from "../../../../../../../modules/translation/webapp/core/TranslationService";
import { AdminContext } from "../../../../../../admin/webapp/core";
import { KIXObject } from "../../../../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { EventService } from "../../../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { KIXObjectService } from "../../../../../../../modules/base-components/webapp/core/KIXObjectService";

export class TicketTypeDetailsContext extends Context {

    public static CONTEXT_ID = 'ticket-type-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<TicketType>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#Type');
        const type = await this.getObject<TicketType>();
        return new BreadcrumbInformation(
            this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${type ? type.Name : ''}`
        );
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TICKET_TYPE, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadTicketType(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.TICKET_TYPE, changedProperties)
            );
        }

        return object;
    }

    private async loadTicketType(changedProperties: string[] = [], cache: boolean = true): Promise<TicketType> {
        const ticketTypeId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Load Ticket Type'
            });
        }, 500);

        const ticketTypes = await KIXObjectService.loadObjects<TicketType>(
            KIXObjectType.TICKET_TYPE, [ticketTypeId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let ticketType: TicketType;
        if (ticketTypes && ticketTypes.length) {
            ticketType = ticketTypes[0];
            this.objectId = ticketType.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return ticketType;
    }

}
