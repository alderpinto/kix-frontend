/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from "../../../server/socket-namespaces/SocketNameSpace";
import { SearchEvent } from "../model/SearchEvent";
import { SaveSearchRequest } from "../model/SaveSearchRequest";
import { SocketResponse } from "../../../modules/base-components/webapp/core/SocketResponse";
import { UserService } from "../../user/server/UserService";
import { User } from "../../user/model/User";
import { ConfigurationService } from "../../../../../server/services/ConfigurationService";
import { SocketEvent } from "../../../modules/base-components/webapp/core/SocketEvent";
import { SocketErrorResponse } from "../../../modules/base-components/webapp/core/SocketErrorResponse";
import { ISocketRequest } from "../../../modules/base-components/webapp/core/ISocketRequest";
import { LoadSearchResponse } from "../model/LoadSearchResponse";
import { DeleteSearchRequest } from "../model/DeleteSearchRequest";
import { ISocketResponse } from "../../../modules/base-components/webapp/core/ISocketResponse";

export class SearchNamespace extends SocketNameSpace {

    private static INSTANCE: SearchNamespace;

    public static getInstance(): SearchNamespace {
        if (!SearchNamespace.INSTANCE) {
            SearchNamespace.INSTANCE = new SearchNamespace();
        }
        return SearchNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'search';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, SearchEvent.SAVE_SEARCH, this.saveSearch.bind(this));
        this.registerEventHandler(client, SearchEvent.LOAD_SEARCH, this.loadSearch.bind(this));
        this.registerEventHandler(client, SearchEvent.DELETE_SEARCH, this.deleteSearch.bind(this));
    }

    private async saveSearch(data: SaveSearchRequest): Promise<SocketResponse> {
        const user = await UserService.getInstance().getUserByToken(data.token)
            .catch((): User => null);

        if (user && data.search) {
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const preferenceId = serverConfig.NOTIFICATION_CLIENT_ID + 'searchprofiles';

            const searchPreference = user.Preferences.find((p) => p.ID === preferenceId);
            let searchConfig = {};

            if (searchPreference) {
                searchConfig = JSON.parse(searchPreference.Value);
                if (data.existingName !== null && data.existingName !== data.search.name) {
                    delete searchConfig[data.existingName];
                }
            }
            searchConfig[data.search.name] = data.search;

            const value = JSON.stringify(searchConfig);
            await UserService.getInstance().setPreferences(data.token, 'SearchNamespace', [[preferenceId, value]]);

            return new SocketResponse(SearchEvent.SAVE_SEARCH_FINISHED, { requestId: data.requestId });
        } else {
            return new SocketResponse(
                SocketEvent.ERROR, new SocketErrorResponse(data.requestId, 'No user or search available.')
            );
        }
    }

    private async loadSearch(data: ISocketRequest): Promise<SocketResponse> {
        const user = await UserService.getInstance().getUserByToken(data.token);
        if (user) {
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const preferenceId = serverConfig.NOTIFICATION_CLIENT_ID + 'searchprofiles';

            const searchPreference = user.Preferences.find((p) => p.ID === preferenceId);

            const searchConfigs = [];
            if (searchPreference) {
                const search = JSON.parse(searchPreference.Value);
                for (const s in search) {
                    if (search[s]) {
                        searchConfigs.push(search[s]);
                    }
                }
            }

            const response = new LoadSearchResponse(data.requestId, searchConfigs);
            return new SocketResponse(SearchEvent.SEARCH_LOADED, response);
        }
    }

    private async deleteSearch(data: DeleteSearchRequest): Promise<SocketResponse> {
        const user = await UserService.getInstance().getUserByToken(data.token);
        if (user) {
            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
            const preferenceId = serverConfig.NOTIFICATION_CLIENT_ID + 'searchprofiles';

            const searchPreference = user.Preferences.find((p) => p.ID === preferenceId);

            if (searchPreference) {
                const search = JSON.parse(searchPreference.Value);
                if (data.name && search[data.name]) {
                    delete search[data.name];
                    const value = JSON.stringify(search);
                    UserService.getInstance().setPreferences(data.token, 'SearchNamespace', [[preferenceId, value]]);
                }
            }

            const response: ISocketResponse = { requestId: data.requestId };
            return new SocketResponse(SearchEvent.SEARCH_DELETED, response);
        }
    }
}
