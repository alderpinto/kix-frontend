import { TranslationDetailsContext } from "../../context";
import { RoutingConfiguration } from "../../../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import {
    KIXObjectType, TranslationProperty, ContextMode, KIXObjectLoadingOptions, DataType
} from "../../../../../model";
import { TranslationTableContentProvider } from "./TranslationTableContentProvider";
import { TableFactory } from "../../../../table/TableFactory";


export class TranslationTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TRANSLATION;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {
        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, tableConfiguration.filter, tableConfiguration.sortOrder, null, [TranslationProperty.LANGUAGES]
        );

        table.setContentProvider(new TranslationTableContentProvider(table, objectIds, loadingOptions, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                TranslationProperty.PATTERN, true, false, true, true, 400, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(
                TranslationProperty.LANGUAGES, true, false, true, true, 250, true, true, true, null, true,
                'label-list-cell-content'
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TRANSLATION, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, TranslationDetailsContext.CONTEXT_ID, KIXObjectType.TRANSLATION,
                ContextMode.DETAILS, TranslationProperty.ID
            );
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
