/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from "../../../../modules/base-components/webapp/core/SocketClient";
import { Attachment } from "../../../../model/kix/Attachment";
import { ClientStorageService } from "../../../../modules/base-components/webapp/core/ClientStorageService";
import { IdService } from "../../../../model/IdService";
import { SocketEvent } from "../../../../modules/base-components/webapp/core/SocketEvent";
import { SocketErrorResponse } from "../../../../modules/base-components/webapp/core/SocketErrorResponse";
import { ISocketResponse } from "../../../../modules/base-components/webapp/core/ISocketResponse";
import { LoadArticleAttachmentRequest } from "../../model/LoadArticleAttachmentRequest";
import { TicketEvent } from "../../model/TicketEvent";
import { LoadArticleAttachmentResponse } from "../../model/LoadArticleAttachmentResponse";
import { LoadArticleZipAttachmentRequest } from "../../model/LoadArticleZipAttachmentRequest";
import { SetArticleSeenFlagRequest } from "../../model/SetArticleSeenFlagRequest";
import { BrowserCacheService } from "../../../../modules/base-components/webapp/core/CacheService";
import { ApplicationEvent } from "../../../base-components/webapp/core/ApplicationEvent";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { EventService } from "../../../base-components/webapp/core/EventService";

export class TicketSocketClient extends SocketClient {

    public static getInstance(): TicketSocketClient {
        if (!TicketSocketClient.INSTANCE) {
            TicketSocketClient.INSTANCE = new TicketSocketClient();
        }

        return TicketSocketClient.INSTANCE;
    }

    private static INSTANCE: TicketSocketClient = null;

    public constructor() {
        super();
        this.socket = this.createSocket('tickets', true);
    }

    private requestPromises: Map<string, Promise<any>> = new Map();

    public async loadArticleAttachment(ticketId: number, articleId: number, attachmentId: number): Promise<Attachment> {

        const cacheKey = `${ticketId}-${articleId}-${attachmentId}`;

        if (BrowserCacheService.getInstance().has(cacheKey, 'Ticket-Article-Attachment')) {
            return BrowserCacheService.getInstance().get(cacheKey, 'Ticket-Article-Attachment');
        }

        if (this.requestPromises.has(cacheKey)) {
            return await this.requestPromises.get(cacheKey);
        }

        const requestPromise = new Promise<Attachment>((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request = new LoadArticleAttachmentRequest(token, requestId, ticketId, articleId, attachmentId);

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.LOAD_ARTICLE_ATTACHMENT);
            }, 30000);

            this.socket.on(TicketEvent.ARTICLE_ATTACHMENT_LOADED, (result: LoadArticleAttachmentResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.attachment);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error);
                }
            });

            this.socket.emit(TicketEvent.LOAD_ARTICLE_ATTACHMENT, request);
        });


        this.requestPromises.set(cacheKey, requestPromise);
        return await requestPromise;
    }

    public loadArticleZipAttachment(ticketId: number, articleId: number): Promise<Attachment> {
        return new Promise((resolve, reject) => {
            const token = ClientStorageService.getToken();
            const requestId = IdService.generateDateBasedId();
            const request = new LoadArticleZipAttachmentRequest(token, requestId, ticketId, articleId);

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT);
            }, 300000);

            this.socket.on(TicketEvent.ARTICLE_ZIP_ATTACHMENT_LOADED, (result: LoadArticleAttachmentResponse) => {
                if (requestId === result.requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.attachment);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT, request);
        });
    }

    public setArticleSeenFlag(ticketId, articleId): Promise<void> {
        return new Promise((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();
            const request = new SetArticleSeenFlagRequest(
                token, requestId, ClientStorageService.getClientRequestId(), ticketId, articleId
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + TicketEvent.REMOVE_ARTICLE_SEEN_FLAG);
            }, 30000);

            this.socket.on(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
                    BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
                    BrowserCacheService.getInstance().deleteKeys(KIXObjectType.TICKET);
                    EventService.getInstance().publish(ApplicationEvent.REFRESH_TOOLBAR);
                    window.clearTimeout(timeout);
                    resolve();
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            this.socket.emit(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG, request);
        });
    }

}
