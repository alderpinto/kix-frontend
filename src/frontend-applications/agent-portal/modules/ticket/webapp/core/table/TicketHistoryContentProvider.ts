/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../base-components/webapp/core/table/TableContentProvider';
import { TicketHistory } from '../../../model/TicketHistory';
import { Table, RowObject, TableValue } from '../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { Ticket } from '../../../model/Ticket';

export class TicketHistoryContentProvider extends TableContentProvider<TicketHistory> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TICKET_HISTORY, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<TicketHistory>>> {
        const rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const ticket = await context.getObject<Ticket>();
            if (ticket) {
                for (const th of ticket.History) {
                    const values: TableValue[] = [];

                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {
                        const tableValue = new TableValue(column.property, th[column.property]);
                        values.push(tableValue);
                    }

                    rowObjects.push(new RowObject<TicketHistory>(values, th));
                }
            }
        }

        return rowObjects;
    }

}
