/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITable, } from "../../table";
import { ConfigItem, KIXObjectLoadingOptions, KIXObjectType } from "../../../model";
import { TableContentProvider } from "../../table/TableContentProvider";

export class ConfigItemTableContentProvider extends TableContentProvider<ConfigItem> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM, table, objectIds, loadingOptions, contextId);
    }

}
