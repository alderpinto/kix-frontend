/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { Table, IRowObject, ITable, RowObject, TableValue } from '../../../../base-components/webapp/core/table';
import { IdService } from '../../../../../model/IdService';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { TableContentProvider } from '../../../../base-components/webapp/core/table/TableContentProvider';
import { CheckListItem } from '../../core/CheckListItem';
import { DataType } from '../../../../../model/DataType';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.checklist = input.checklist || [];
        this.state.field = input.field;
    }

    public async onMount(): Promise<void> {
        this.prepareTable();
    }

    private async prepareTable(): Promise<void> {
        if (this.state.checklist && this.state.field) {

            const actionTitle = await TranslationService.translate('Translatable#Action');
            const stateTitle = await TranslationService.translate('Translatable#State');

            const columns = [
                new DefaultColumnConfiguration(
                    null, null, null, 'title', true, false, true, false,
                    170, false, false, false, DataType.STRING, true, null, actionTitle
                ),
                new DefaultColumnConfiguration(
                    null, null, null, 'value', true, true, true, false,
                    100, false, false, false, DataType.STRING, true, null, stateTitle
                )
            ];

            const configuration = new TableConfiguration(
                null, null, null, KIXObjectType.ANY, null, null, columns, null, false, false, null, null,
                TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );

            const table = new Table(IdService.generateDateBasedId('df-checklist-info-table'), configuration);
            table.setContentProvider(new DynamicFieldChecklistTableContentProvider(this.state.checklist, table));
            table.setColumnConfiguration(columns);

            this.state.table = table;
        }
    }
}

// tslint:disable-next-line:max-classes-per-file
class DynamicFieldChecklistTableContentProvider extends TableContentProvider {

    public constructor(private checklist: CheckListItem[], table: ITable) {
        super(null, table, null, null);
    }

    public async loadData(): Promise<Array<IRowObject<CheckListItem>>> {
        return this.createRowsForChecklist();
    }

    protected createRowsForChecklist(
        checklist: CheckListItem[] = this.checklist, parent?: RowObject<CheckListItem>
    ): RowObject[] {
        const rowObjects = [];
        for (const item of checklist) {
            const values: TableValue[] = [];
            values.push(new TableValue('title', item.title, item.title));

            const icons = [];
            if (item.value === 'OK') {
                icons.push('kix-icon-check');
            } else if (item.value === 'NOK') {
                icons.push('kix-icon-exclamation');
            } else if (item.value === 'PENDING') {
                icons.push('kix-icon-time-wait');
            } else if (item.value === 'n.a.') {
                icons.push('kix-icon-unknown');
            }

            values.push(new TableValue('value', item.value, item.value, null, icons));

            const rowObject = new RowObject<CheckListItem>(values, item);
            rowObjects.push(rowObject);

            if (item.sub && item.sub.length) {
                const subRows = this.createRowsForChecklist(item.sub, rowObject);
                subRows.forEach((r) => rowObject.addChild(r));
            }
        }

        return rowObjects;
    }

}

module.exports = Component;