import { Ticket } from "../../../model";
import { TicketLabelProvider } from "..";
import { AbstractTableLayer, TableRow, TableColumn } from "../..";

export class TicketTableLabelLayer extends AbstractTableLayer {

    private labelProvider = new TicketLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id, null, true);
        }
        return columns;
    }

    public async getRows(refresh: boolean = false): Promise<Array<TableRow<Ticket>>> {
        const rows = await this.getPreviousLayer().getRows(refresh);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const row = await this.setTableValues(rows[i]);
            row.classes = this.labelProvider.getObjectClasses(row.object);
            result.push(row);
        }
        return result;
    }

    protected async setTableValues(row: TableRow<Ticket>): Promise<TableRow<Ticket>> {
        for (const value of row.values) {
            value.classes = this.labelProvider.getDisplayTextClasses(row.object, value.columnId);
        }
        row.classes = this.labelProvider.getObjectClasses(row.object);
        return row;
    }

}
