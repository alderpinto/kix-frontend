/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    TableConfiguration, ITable, Table, TableHeaderHeight, TableRowHeight, DefaultColumnConfiguration
} from "../../../base-components/webapp/core/table";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TableFactory } from "../../../base-components/webapp/core/table/TableFactory";
import { DynamicFieldProperty } from "../../model/DynamicFieldProperty";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { IColumnConfiguration } from "../../../../model/configuration/IColumnConfiguration";
import { DynamicFieldTableContentProvider } from "./DynamicFieldTableContentProvider";
import { DialogRoutingConfiguration } from "../../../../model/configuration/DialogRoutingConfiguration";
import { ContextMode } from "../../../../model/ContextMode";

export class DynamicFieldTableFactory extends TableFactory {


    public objectType: KIXObjectType = KIXObjectType.DYNAMIC_FIELD;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(new DynamicFieldTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(DynamicFieldProperty.NAME),
            this.getDefaultColumnConfiguration(DynamicFieldProperty.LABEL),
            this.getDefaultColumnConfiguration(DynamicFieldProperty.FIELD_TYPE),
            this.getDefaultColumnConfiguration(DynamicFieldProperty.OBJECT_TYPE),
            this.getDefaultColumnConfiguration(DynamicFieldProperty.INTERNAL_FIELD),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY),
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.DYNAMIC_FIELD, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new DialogRoutingConfiguration(
                null, KIXObjectType.DYNAMIC_FIELD, ContextMode.EDIT_ADMIN,
                DynamicFieldProperty.ID, null, true,
                undefined, true, 'dynamic-field-edit-form'
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case DynamicFieldProperty.FIELD_TYPE:
            case DynamicFieldProperty.OBJECT_TYPE:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 150, true, true, true);
                break;
            case DynamicFieldProperty.INTERNAL_FIELD:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, false, true, true, false, 100, true, true, true);
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}