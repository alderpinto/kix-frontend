/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../base-components/webapp/core/table/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../base-components/webapp/core/table';
import { LinkObjectTableContentProvider } from './LinkObjectTableContentProvider';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { LinkObjectProperty } from '../../../model/LinkObjectProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { KIXObject } from '../../../../../model/kix/KIXObject';


export class LinkObjectTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.LINK_OBJECT;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType | string, objects?: KIXObject[]
    ): Table {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(new LinkObjectTableContentProvider(table, objectIds, null, contextId, objects));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(null, null, null,
                LinkObjectProperty.LINKED_OBJECT_TYPE, true, true, true, true, 200, true, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                LinkObjectProperty.LINKED_OBJECT_DISPLAY_ID, true, false, true, true, 200, true, true
            ),
            new DefaultColumnConfiguration(
                null, null, null, LinkObjectProperty.TITLE, true, false, true, true, 500, true, true),
            new DefaultColumnConfiguration(null, null, null,
                LinkObjectProperty.LINKED_AS, true, false, true, true, 140, true, true, true
            ),
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null, KIXObjectType.LINK_OBJECT,
                null, 10, tableColumns, [], true, false, null,
                null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

}
