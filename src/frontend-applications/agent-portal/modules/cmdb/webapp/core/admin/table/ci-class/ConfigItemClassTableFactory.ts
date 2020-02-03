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
import { ConfigItemClassTableContentProvider } from ".";
import { ConfigItemClassProperty } from "../../../../../model/ConfigItemClassProperty";
import { KIXObjectProperty } from "../../../../../../../model/kix/KIXObjectProperty";
import { TableHeaderHeight } from "../../../../../../../model/configuration/TableHeaderHeight";
import { TableRowHeight } from "../../../../../../../model/configuration/TableRowHeight";
import { RoutingConfiguration } from "../../../../../../../model/configuration/RoutingConfiguration";
import { ConfigItemClassDetailsContext } from "../..";
import { ContextMode } from "../../../../../../../model/ContextMode";
import { IColumnConfiguration } from "../../../../../../../model/configuration/IColumnConfiguration";
import {
    DefaultColumnConfiguration
} from "../../../../../../../model/configuration/DefaultColumnConfiguration";
import { DataType } from "../../../../../../../model/DataType";

export class ConfigItemClassTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new ConfigItemClassTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(ConfigItemClassProperty.NAME),
            this.getDefaultColumnConfiguration('ICON'),
            this.getDefaultColumnConfiguration(ConfigItemClassProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.CONFIG_ITEM_CLASS, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                ConfigItemClassDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM_CLASS,
                ContextMode.DETAILS, ConfigItemClassProperty.ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case ConfigItemClassProperty.NAME:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
