/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from "../../../../../../base-components/webapp/core/table/TableFactory";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { TableConfiguration } from "../../../../../../../model/configuration/TableConfiguration";
import { ITable, Table } from "../../../../../../base-components/webapp/core/table";
import { TranslationLanguageTableContentProvider } from ".";
import {
    DefaultColumnConfiguration
} from "../../../../../../../model/configuration/DefaultColumnConfiguration";
import { TranslationLanguageProperty } from "../../../../../model/TranslationLanguageProperty";
import { TableHeaderHeight } from "../../../../../../../model/configuration/TableHeaderHeight";
import { TableRowHeight } from "../../../../../../../model/configuration/TableRowHeight";

export class TranslationLanguageTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TRANSLATION_LANGUAGE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TranslationLanguageTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(null, null, null,
                TranslationLanguageProperty.LANGUAGE, true, false, true, true, 150, true, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                TranslationLanguageProperty.VALUE, true, false, true, true, 400, true, true, false,
                null, true, null, null, false
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.TRANSLATION_LANGUAGE, null, null, tableColumns, [], false, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            //
        }

        return tableConfiguration;
    }
}
