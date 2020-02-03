/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from "../../../../modules/base-components/webapp/core/SocketClient";
import { SearchCache } from "../../model/SearchCache";
import { IdService } from "../../../../model/IdService";
import { ClientStorageService } from "../../../../modules/base-components/webapp/core/ClientStorageService";
import { SaveSearchRequest } from "../../model/SaveSearchRequest";
import { SearchEvent } from "../../model/SearchEvent";
import { ISocketResponse } from "../../../../modules/base-components/webapp/core/ISocketResponse";
import { SocketEvent } from "../../../../modules/base-components/webapp/core/SocketEvent";
import { SocketErrorResponse } from "../../../../modules/base-components/webapp/core/SocketErrorResponse";
import { LoadSearchResponse } from "../../model/LoadSearchResponse";
import { ISocketRequest } from "../../../../modules/base-components/webapp/core/ISocketRequest";
import { DeleteSearchRequest } from "../../model/DeleteSearchRequest";

export class SearchSocketClient extends SocketClient {

    public static getInstance(): SearchSocketClient {
        if (!SearchSocketClient.INSTANCE) {
            SearchSocketClient.INSTANCE = new SearchSocketClient();
        }

        return SearchSocketClient.INSTANCE;
    }

    private static INSTANCE: SearchSocketClient = null;

    private constructor() {
        super();
        this.socket = this.createSocket('search', true);
    }

    public async saveSearch(search: SearchCache, existingName: string): Promise<void> {
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {
            const requestId = IdService.generateDateBasedId();
            const token = ClientStorageService.getToken();

            const request = new SaveSearchRequest(
                token, requestId, ClientStorageService.getClientRequestId(), search, existingName
            );

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + SearchEvent.SAVE_SEARCH);
            }, socketTimeout);

            this.socket.on(SearchEvent.SAVE_SEARCH_FINISHED, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
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

            this.socket.emit(SearchEvent.SAVE_SEARCH, request);
        });
    }

    public async loadSearch(): Promise<SearchCache[]> {
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<SearchCache[]>((resolve, reject) => {

            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + SearchEvent.LOAD_SEARCH);
            }, socketTimeout);

            const requestId = IdService.generateDateBasedId('search-');

            this.socket.on(SearchEvent.SEARCH_LOADED, (result: LoadSearchResponse) => {
                if (result.requestId === requestId) {
                    window.clearTimeout(timeout);
                    resolve(result.search);
                }
            });

            this.socket.on(SocketEvent.ERROR, (error: SocketErrorResponse) => {
                if (error.requestId === requestId) {
                    window.clearTimeout(timeout);
                    console.error(error.error);
                    reject(error.error);
                }
            });

            const request: ISocketRequest = {
                token,
                clientRequestId: ClientStorageService.getClientRequestId(),
                requestId
            };
            this.socket.emit(
                SearchEvent.LOAD_SEARCH, request
            );
        });
    }

    public async deleteSearch(name: string): Promise<void> {
        const socketTimeout = ClientStorageService.getSocketTimeout();
        return new Promise<void>((resolve, reject) => {

            const token = ClientStorageService.getToken();

            const timeout = window.setTimeout(() => {
                reject('Timeout: ' + SearchEvent.DELETE_SEARCH);
            }, socketTimeout);

            const requestId = IdService.generateDateBasedId('search-');

            this.socket.on(SearchEvent.SEARCH_DELETED, (result: ISocketResponse) => {
                if (result.requestId === requestId) {
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

            const request = new DeleteSearchRequest(token, requestId, ClientStorageService.getClientRequestId(), name);
            this.socket.emit(SearchEvent.DELETE_SEARCH, request);
        });
    }

}
