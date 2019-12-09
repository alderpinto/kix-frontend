/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from "../../../server/socket-namespaces/SocketNameSpace";
import { TicketEvent } from "../model/TicketEvent";
import { LoadArticleAttachmentRequest } from "../model/LoadArticleAttachmentRequest";
import { SocketResponse } from "../../../modules/base-components/webapp/core/SocketResponse";
import { LoadArticleAttachmentResponse } from "../model/LoadArticleAttachmentResponse";
import { SocketEvent } from "../../../modules/base-components/webapp/core/SocketEvent";
import { SocketErrorResponse } from "../../../modules/base-components/webapp/core/SocketErrorResponse";
import { LoadArticleZipAttachmentRequest } from "../model/LoadArticleZipAttachmentRequest";
import { SetArticleSeenFlagRequest } from "../model/SetArticleSeenFlagRequest";
import { TicketAPIService } from "./TicketService";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { CacheService } from "../../../server/services/cache";

export class TicketNamespace extends SocketNameSpace {

    private static INSTANCE: TicketNamespace;

    public static getInstance(): TicketNamespace {
        if (!TicketNamespace.INSTANCE) {
            TicketNamespace.INSTANCE = new TicketNamespace();
        }
        return TicketNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'tickets';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, TicketEvent.LOAD_ARTICLE_ATTACHMENT, this.loadArticleAttachment.bind(this));
        this.registerEventHandler(
            client, TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT, this.loadArticleZipAttachment.bind(this)
        );
        this.registerEventHandler(client, TicketEvent.REMOVE_ARTICLE_SEEN_FLAG, this.removeArticleSeenFlag.bind(this));
    }

    private async loadArticleAttachment(data: LoadArticleAttachmentRequest): Promise<SocketResponse> {
        const response = await TicketAPIService.getInstance().loadArticleAttachment(
            data.token, data.ticketId, data.articleId, data.attachmentId
        ).then((attachment) =>
            new SocketResponse(
                TicketEvent.ARTICLE_ATTACHMENT_LOADED,
                new LoadArticleAttachmentResponse(data.requestId, attachment)
            )
        ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async loadArticleZipAttachment(data: LoadArticleZipAttachmentRequest): Promise<SocketResponse> {
        const response = await TicketAPIService.getInstance().loadArticleZipAttachment(
            data.token, data.ticketId, data.articleId
        ).then((attachment) =>
            new SocketResponse(
                TicketEvent.ARTICLE_ZIP_ATTACHMENT_LOADED,
                new LoadArticleAttachmentResponse(data.requestId, attachment)
            )
        ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async removeArticleSeenFlag(data: SetArticleSeenFlagRequest): Promise<SocketResponse> {
        const response = await TicketAPIService.getInstance().setArticleSeenFlag(
            data.token, null, data.ticketId, data.articleId
        ).then(() =>
            new SocketResponse(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE, { requestId: data.requestId })
        ).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        CacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
        CacheService.getInstance().deleteKeys(KIXObjectType.TICKET);

        return response;
    }
}
