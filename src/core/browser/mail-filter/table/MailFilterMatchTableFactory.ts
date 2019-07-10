import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../table";
import { KIXObjectType, DataType } from "../../../model";
import { MailFilterMatchTableContentProvider } from "./MailFilterMatchTableContentProvider";
import { TableFactory } from "../../table/TableFactory";

export class MailFilterMatchTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.MAIL_FILTER_MATCH;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new MailFilterMatchTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                'Key', true, false, true, false, 200, true, true,
                false, DataType.STRING, true, null, 'Translatable#Email Header', false
            ),
            new DefaultColumnConfiguration(
                'Not', false, true, true, false, 100, true, false,
                false, DataType.NUMBER, true, null, 'Translatable#Negate', false
            ),
            new DefaultColumnConfiguration(
                'Value', true, false, true, false, 300, true, true,
                false, DataType.STRING, true, null, 'Translatable#Pattern', false
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.MAIL_FILTER_MATCH, null, null, tableColumns, false, false, null, null,
                TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}