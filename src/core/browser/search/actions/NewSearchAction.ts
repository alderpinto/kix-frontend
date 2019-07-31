/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction, CacheState, ContextMode } from "../../../model";
import { SearchService } from "../../kix/search/SearchService";
import { ContextService } from "../../context";

export class NewSearchAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Search';
        this.icon = 'kix-icon-new-search';
    }

    public async run(event: any): Promise<void> {
        const cache = SearchService.getInstance().getSearchCache();
        const objectType = cache ? cache.objectType : null;

        if (cache) {
            cache.status = CacheState.INVALID;
        }

        ContextService.getInstance().setDialogContext(null, objectType, ContextMode.SEARCH);
    }

}