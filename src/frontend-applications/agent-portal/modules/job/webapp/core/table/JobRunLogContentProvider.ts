/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../base-components/webapp/core/table/TableContentProvider';
import { Table, RowObject, TableValue } from '../../../../base-components/webapp/core/table';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { JobRunLog } from '../../../model/JobRunLog';
import { JobRunLogProperty } from '../../../model/JobRunLogProperty';

export class JobRunLogContentProvider extends TableContentProvider<JobRunLog> {

    public constructor(
        private logs: JobRunLog[],
        table: Table
    ) {
        super(KIXObjectType.JOB_RUN_LOG, table, null, null);
    }

    public async loadData(): Promise<Array<RowObject<JobRunLog>>> {
        const rowObjects = [];
        if (this.logs && this.logs.length) {
            let number = 1;
            for (const log of this.logs) {
                const values: TableValue[] = [];

                const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                for (const column of columns) {
                    if (column.property === JobRunLogProperty.NUMBER) {
                        values.push(new TableValue(column.property, number, number.toString()));
                    } else {
                        const tableValue = new TableValue(column.property, log[column.property]);
                        values.push(tableValue);
                    }
                }

                rowObjects.push(new RowObject<JobRunLog>(values, log));
                number++;
            }
        }

        return rowObjects;
    }

}
