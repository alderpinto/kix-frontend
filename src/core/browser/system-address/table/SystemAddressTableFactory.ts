/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RoutingConfiguration } from "../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../table";
import { KIXObjectType, DataType, ContextMode, KIXObjectLoadingOptions } from "../../../model";
import { SystemAddressTableContentProvider } from "./SystemAddressTableContentProvider";
import { SystemAddressProperty } from "../../../model/kix/systemaddress";
import { TableFactory } from "../../table/TableFactory";
import { SystemAddressDetailsContext } from "../context";

export class SystemAddressTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new SystemAddressTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(null, null, null,
                SystemAddressProperty.NAME, true, false, true, false, 150, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                SystemAddressProperty.REALNAME, true, false, true, false, 150, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                SystemAddressProperty.VALID_ID, true, false, true, false, 100, true, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                SystemAddressProperty.CREATE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                null, null, null, SystemAddressProperty.CREATE_BY, true, false, true, false, 150, true, true),
            new DefaultColumnConfiguration(null, null, null,
                SystemAddressProperty.CHANGE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                null, null, null, SystemAddressProperty.CHANGE_BY, true, false, true, false, 150, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.SYSTEM_ADDRESS, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                SystemAddressDetailsContext.CONTEXT_ID, KIXObjectType.SYSTEM_ADDRESS,
                ContextMode.DETAILS, SystemAddressProperty.ID
            );
        }

        return tableConfiguration;
    }
}
