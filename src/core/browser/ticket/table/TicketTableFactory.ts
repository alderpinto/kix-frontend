/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, TicketProperty, ContextMode, DataType, KIXObjectLoadingOptions } from "../../../model";
import { RoutingConfiguration } from "../../router";
import { TicketDetailsContext } from "../context";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration, ToggleOptions, IColumnConfiguration
} from "../../table";
import { TicketTableContentProvider } from "./new";
import { TableFactory } from "../../table/TableFactory";

export class TicketTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );

        const table = new Table(tableKey, tableConfiguration, contextId);

        const contentProvider = new TicketTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        );

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): TableConfiguration {
        let tableColumns;

        if (short) {
            tableColumns = [
                new DefaultColumnConfiguration(
                    TicketProperty.PRIORITY_ID, false, true, true, false, 65, true, true, true, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, false, 135, true, true),
                new DefaultColumnConfiguration(TicketProperty.TITLE, true, false, true, false, 160, true, true),
                new DefaultColumnConfiguration(TicketProperty.STATE_ID, true, true, true, false, 150, true, true, true),
                new DefaultColumnConfiguration(
                    TicketProperty.QUEUE_ID, true, false, true, false, 100, true, true, true
                ),
                new DefaultColumnConfiguration(
                    TicketProperty.OWNER_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(
                    TicketProperty.ORGANISATION_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(
                    TicketProperty.CREATED, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
                )
            ];
        } else {
            tableColumns = [
                new DefaultColumnConfiguration(
                    TicketProperty.PRIORITY_ID, false, true, true, false, 65, true, true, true, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    TicketProperty.UNSEEN, false, true, false, false, 41, true, false, false, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    TicketProperty.WATCHERS, false, true, false, false, 41, true, false, false, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, false, 135, true, true),
                new DefaultColumnConfiguration(TicketProperty.TITLE, true, false, true, false, 260, true, true),
                new DefaultColumnConfiguration(TicketProperty.STATE_ID, true, true, true, false, 150, true, true, true),
                new DefaultColumnConfiguration(TicketProperty.LOCK_ID, false, true, false, false, 41, true, true, true),
                new DefaultColumnConfiguration(
                    TicketProperty.QUEUE_ID, true, false, true, false, 100, true, true, true
                ),
                new DefaultColumnConfiguration(
                    TicketProperty.RESPONSIBLE_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(
                    TicketProperty.OWNER_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(
                    TicketProperty.ORGANISATION_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(
                    TicketProperty.CHANGED, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
                ),
                new DefaultColumnConfiguration(
                    TicketProperty.AGE, true, false, true, false, 90, true, true, false, DataType.DATE_TIME
                )
            ];
        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(KIXObjectType.TICKET, null, null, tableColumns, true);
            defaultToggle = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                TicketDetailsContext.CONTEXT_ID, KIXObjectType.TICKET,
                ContextMode.DETAILS, TicketProperty.TICKET_ID
            );
        }
        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('ticket-article-details', 'article', [], false);
        }

        tableConfiguration.objectType = KIXObjectType.TICKET;
        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }

}
