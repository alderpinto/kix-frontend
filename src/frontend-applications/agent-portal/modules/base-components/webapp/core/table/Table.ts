/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Row } from './Row';
import { Column } from './Column';
import { ITableContentProvider } from './ITableContentProvider';
import { RowObject } from './RowObject';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { TableSortUtil } from './TableSortUtil';
import { SelectionState } from './SelectionState';
import { TableEvent } from './TableEvent';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableValue } from './TableValue';
import { ValueState } from './ValueState';
import { TableEventData } from './TableEventData';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { UIFilterCriterion } from '../../../../../model/UIFilterCriterion';
import { SortOrder } from '../../../../../model/SortOrder';
import { EventService } from '../EventService';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { KIXObjectService } from '../KIXObjectService';
import { DynamicField } from '../../../../dynamic-fields/model/DynamicField';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { DynamicFieldProperty } from '../../../../dynamic-fields/model/DynamicFieldProperty';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { ServiceRegistry } from '../ServiceRegistry';
import { AdditionalTableObjectsHandlerConfiguration } from '../AdditionalTableObjectsHandlerConfiguration';
import { IAdditionalTableObjectsHandler } from '../IAdditionalTableObjectsHandler';


export class Table implements Table {

    private rows: Row[] = [];
    private filteredRows: Row[] = null;
    private columns: Column[] = [];
    private contentProvider: ITableContentProvider;
    private columnConfiguration: IColumnConfiguration[];

    private filterValue: string;
    private filterCriteria: UIFilterCriterion[];

    private initialized: boolean = false;

    private sortColumnId: string;
    private sortOrder: SortOrder;

    private reloadPromise: Promise<void>;
    private handlerRowObjects = {};

    public constructor(
        private tableKey: string,
        private tableConfiguration?: TableConfiguration,
        private contextId?: string
    ) { }

    public getTableId(): string {
        return this.tableKey;
    }

    public getContextId(): string {
        return this.contextId;
    }

    public getTableConfiguration(): TableConfiguration {
        return this.tableConfiguration;
    }

    public getObjectType(): KIXObjectType | string {
        return this.tableConfiguration
            ? this.tableConfiguration.objectType
            : this.contentProvider.getObjectType();
    }

    public setContentProvider(contentProvider: ITableContentProvider): void {
        this.contentProvider = contentProvider;
    }

    public setColumnConfiguration(columnConfiguration: IColumnConfiguration[]) {
        this.columnConfiguration = columnConfiguration;
    }

    public async initialize(): Promise<void> {
        if (!this.initialized) {
            this.initialized = true;

            this.columns = [];
            if (this.columnConfiguration) {
                for (const c of this.columnConfiguration) {
                    await this.createColumn(c);
                }
            }

            if (this.contentProvider) {
                await this.contentProvider.initialize();
            }
            await this.loadRowData();

            this.rows.forEach((r) => {
                this.columns.forEach((c) => {
                    r.addCell(new TableValue(c.getColumnId(), null));
                });

                r.initializeDisplayValues();
            });

            if (this.sortColumnId && this.sortOrder) {
                await this.sort(this.sortColumnId, this.sortOrder);
            }

            if (this.tableConfiguration &&
                this.tableConfiguration.toggle &&
                this.tableConfiguration.toggleOptions &&
                this.tableConfiguration.toggleOptions.toggleFirst &&
                this.rows.length
            ) {
                this.rows[0].expand(true);
            }
        }
    }

    private async loadRowData(relevantHandlerConfigIds?: string[]): Promise<void> {
        this.rows = [];
        this.filteredRows = null;

        if (this.contentProvider) {
            const rows = [];
            let rowObjects: RowObject[] = await this.contentProvider.loadData();

            if (
                // if intersection is active and no rowobjects found, result list is always empty, so ignore handler
                (!this.tableConfiguration.intersection || (rowObjects && rowObjects.length))
                && this.tableConfiguration
                && Array.isArray(this.tableConfiguration.additionalTableObjectsHandler)
                && this.tableConfiguration.additionalTableObjectsHandler.length
            ) {
                rowObjects = await this.considerHandlerData(rowObjects, relevantHandlerConfigIds);
            }

            rowObjects.forEach((d) => rows.push(this.createRow(d)));
            this.rows = rows;
        }
    }

    private async considerHandlerData(rowObjects: RowObject<any>[], relevantHandlerConfigIds?: string[]) {
        for (const handlerConfig of this.tableConfiguration.additionalTableObjectsHandler) {
            if (handlerConfig && handlerConfig.handlerId) {
                if (
                    !Array.isArray(relevantHandlerConfigIds)
                    || relevantHandlerConfigIds.some((rhid) => rhid === handlerConfig.id)
                    || !Array.isArray(this.handlerRowObjects[handlerConfig.id])
                ) {
                    const handler = ServiceRegistry.getAdditionalTableObjectsHandler(handlerConfig.handlerId);
                    if (handler) {
                        await this.prepareHandlerRowObjects(handler, handlerConfig);
                    }
                }

                if (this.handlerRowObjects && Array.isArray(this.handlerRowObjects[handlerConfig.id])) {
                    if (this.tableConfiguration.intersection) {
                        rowObjects = rowObjects.filter((ro) => this.handlerRowObjects[handlerConfig.id].some(
                            (hro) => ro.getObject().ObjectId === hro.getObject().ObjectId
                        ));
                    } else {
                        this.handlerRowObjects[handlerConfig.id].forEach((hro) => {
                            if (!rowObjects.some(
                                (ro) => ro.getObject().ObjectId === hro.getObject().ObjectId)) {
                                rowObjects.push(hro);
                            }
                        });
                    }
                }
            }
        }
        return rowObjects;
    }

    private async prepareHandlerRowObjects(
        handler: IAdditionalTableObjectsHandler,
        handlerConfig: AdditionalTableObjectsHandlerConfiguration
    ): Promise<void> {
        const objects = await handler.determineObjects(handlerConfig, this.tableConfiguration.loadingOptions);
        const handlerRowObjects = objects ? await this.contentProvider.getRowObjects(objects) : [];
        this.handlerRowObjects[handlerConfig.id] = handlerRowObjects;
    }

    public createRow(tableObject?: RowObject): Row {
        const row = new Row(this, tableObject);
        this.rows.push(row);
        return row;
    }

    private async createColumn(columnConfiguration: IColumnConfiguration): Promise<Column> {
        let column;

        let canCreate: boolean = false;
        const dfName = KIXObjectService.getDynamicFieldName(columnConfiguration.property);
        if (columnConfiguration && dfName) {
            canCreate = await this.checkDF(dfName);
        } else {
            canCreate = true;
        }

        if (canCreate) {
            column = new Column(this, columnConfiguration);
            this.columns.push(column);
        }

        return column;
    }

    private async checkDF(dfName: string): Promise<boolean> {
        let can = false;
        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null,
            new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        DynamicFieldProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                        FilterType.AND, dfName
                    )
                ], null, null, [DynamicFieldProperty.CONFIG]
            ), null, true
        ).catch(() => [] as DynamicField[]);
        if (dynamicFields.length && dynamicFields[0] && dynamicFields[0].ValidID === 1) {
            can = true;
        }
        return can;
    }

    public getRows(all: boolean = false): Row[] {
        if (all) {
            return this.rows;
        }
        return this.filteredRows ? [...this.filteredRows] : [...this.rows];
    }

    public getSelectedRows(all?: boolean): Row[] {
        const rows = this.getRows(all);
        const selectedRows = this.determineSelectedRows(rows);
        return selectedRows;
    }

    private determineSelectedRows(rows: Row[]): Row[] {
        let selectedRows = [];

        rows.forEach((r) => {
            if (r.isSelected()) {
                selectedRows.push(r);
            }

            const children = r.getChildren();
            if (children && children.length) {
                const selectedSubRows = this.determineSelectedRows(children);
                selectedRows = [...selectedRows, ...selectedSubRows];
            }
        });

        return selectedRows;
    }

    public getRow(rowId: string): Row {
        // TODO: neue Zeile liefern, nicht die Referenz
        return this.rows.find((r) => r.getRowId() === rowId);
    }

    public removeRows(rowIds: string[]): Row[] {
        const removedRows = [];
        this.rows = this.rows.filter((r) => {
            if (rowIds.some((id) => id === r.getRowId())) {
                removedRows.push(r);
                return false;
            } else {
                return true;
            }
        });
        EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
        return removedRows;
    }

    public addRows(addRows: Row[], index: number = this.rows.length): void {
        const newRows = [];
        addRows.forEach((r) => {
            if (
                !newRows.some((nr) => nr.getRowId() === r.getRowId())
                && !this.rows.some((kr) => kr.getRowId() === r.getRowId())
            ) {
                // TODO: new Row erzeugen, um Referenzen zu vermeiden
                newRows.push(r);
            }
        });
        if (!!newRows.length) {
            this.rows.splice(index, 0, ...newRows);
        }
    }

    public replaceRows(replaceRows: Array<[string, Row]>): Row[] {
        let replacedRows = [];
        replaceRows.forEach((r) => {
            let replaceRowIndex = this.rows.findIndex((kr) => kr.getRowId() === r[0]);
            if (replaceRowIndex !== -1) {
                const checkNewRowIndex = this.rows.findIndex((kr) => kr.getRowId() === r[1].getRowId());
                if (checkNewRowIndex !== -1) {
                    this.rows.splice(checkNewRowIndex, 1);
                    if (checkNewRowIndex < replaceRowIndex) {
                        replaceRowIndex = this.rows.findIndex((kr) => kr.getRowId() === r[0]);
                    }
                }

                // TODO: new Row erzeugen, um Referenzen zu vermeiden
                replacedRows = [...replacedRows, ...this.rows.splice(replaceRowIndex, 1, r[1])];
            }
        });
        return replacedRows;
    }

    public getColumns(): Column[] {
        return [...this.columns];
    }

    public getColumn(columnId: string): Column {
        return this.columns.find((r) => r.getColumnId() === columnId);
    }

    public removeColumns(columnIds: string[]): Column[] | IColumnConfiguration[] {
        const removedColumns = [];
        if (!this.initialized) {
            this.columnConfiguration = this.columnConfiguration.filter((cc) => {
                if (columnIds.some((id) => id === cc.property)) {
                    removedColumns.push(cc);
                    return false;
                } else {
                    return true;
                }
            });
        } else {
            this.columns = this.columns.filter((c) => {
                if (columnIds.some((id) => id === c.getColumnId())) {
                    removedColumns.push(c);
                    return false;
                } else {
                    return true;
                }
            });
            this.reload(true, false);
        }
        return removedColumns;
    }

    public async addColumns(columnConfigs: IColumnConfiguration[]): Promise<void> {
        if (!this.initialized) {
            if (!this.columnConfiguration) {
                this.columnConfiguration = [...columnConfigs];
            } else {
                this.columnConfiguration.push(...columnConfigs);
            }
        } else {
            for (const c of columnConfigs) {
                if (!this.hasColumn(c.property)) {
                    await this.createColumn(c);
                    this.updateRowValues();
                }
            }
            this.reload(true, false);
        }
    }

    private updateRowValues(): void {
        this.rows.forEach((r) => r.updateValues());
    }

    private hasColumn(id: string): boolean {
        return this.columns.some((kr) => kr.getColumnId() === id);
    }

    public getFilterValue(): string {
        return this.filterValue;
    }

    public setFilter(filterValue?: string, criteria?: UIFilterCriterion[]): void {
        this.filterValue = filterValue;
        this.filterCriteria = criteria;
    }

    public async filter(): Promise<void> {
        if (this.isFilterDefined(this.filterValue, this.filterCriteria)) {
            this.filteredRows = [];
            const rows = [...this.rows];
            for (const row of rows) {
                const match = await row.filter(this.filterValue, this.filterCriteria);
                if (match) {
                    this.filteredRows.push(row);
                }
            }
        } else {
            this.filteredRows = null;
            for (const row of this.rows) {
                await row.filter(null, null);
            }
        }

        await this.filterColumns();

        EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
        EventService.getInstance().publish(TableEvent.TABLE_FILTERED, new TableEventData(this.getTableId()));
    }

    private async filterColumns(): Promise<void> {
        for (const column of this.getColumns()) {
            const filter: [string, UIFilterCriterion[]] = column.getFilter();
            if (this.isFilterDefined(filter[0], filter[1])) {
                const rows: Row[] = [];
                if (filter[0] && filter[0] !== '') {
                    filter[1] = [
                        new UIFilterCriterion(column.getColumnId(), SearchOperator.CONTAINS, filter[0], false, true)
                    ];
                }
                for (const row of this.getRows()) {
                    const match = await row.filter(null, filter[1]);
                    if (match) {
                        rows.push(row);
                    }
                }
                this.filteredRows = rows;
            }
        }
    }

    private isFilterDefined(value: string, criteria: UIFilterCriterion[]): boolean {
        return (value && value !== '') || (criteria && criteria.length !== 0);
    }

    public async sort(columnId: string, sortOrder: SortOrder): Promise<void> {
        this.sortColumnId = columnId;
        this.sortOrder = sortOrder;

        this.getColumns().forEach((c) => c.setSortOrder(null));
        const column = this.getColumn(columnId);
        if (column) {
            column.setSortOrder(sortOrder);

            if (this.filteredRows) {
                this.filteredRows = await TableSortUtil.sort(
                    this.filteredRows, columnId, sortOrder, column.getColumnConfiguration().dataType
                );
                const sortPromises = [];
                for (const row of this.filteredRows) {
                    sortPromises.push(row.sortChildren(columnId, sortOrder, column.getColumnConfiguration().dataType));
                }
                await Promise.all(sortPromises);
            } else {
                this.rows = await TableSortUtil.sort(
                    this.rows, columnId, sortOrder, column.getColumnConfiguration().dataType
                );
                const sortPromises = [];
                for (const row of this.rows) {
                    sortPromises.push(row.sortChildren(columnId, sortOrder, column.getColumnConfiguration().dataType));
                }
                await Promise.all(sortPromises);
            }
            EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
            EventService.getInstance().publish(
                TableEvent.SORTED, new TableEventData(this.getTableId(), null, columnId)
            );
        }
    }

    public setRowSelection(rowIds: string[]): void {
        this.getRows(true).forEach((r) => {
            if (rowIds.some((rId) => rId === r.getRowId())) {
                r.select();
            } else {
                r.select(false);
            }
        });
    }

    public setRowSelectionByObject(objects: any[]): void {
        this.selectNone(true);
        objects.forEach((o) => {
            const row = this.getRowByObject(o);
            if (row) {
                row.select();
            }
        });
    }

    public selectAll(withoutFilter: boolean = false): void {
        this.getRows(withoutFilter).forEach((r) => r.select(undefined, true, withoutFilter, false));
    }

    public selectNone(withoutFilter: boolean = false): void {
        this.getRows(withoutFilter).forEach((r) => r.select(false, true, withoutFilter, false));
    }

    public selectRowByObject(object: any, select?: boolean): void {
        const row = this.getRowByObject(object);
        if (row) {
            row.select(select);
        }
    }

    public setRowsSelectableByObject(objects: any[], selectable: boolean): void {
        objects.forEach((o) => {
            const row = this.getRowByObject(o);
            if (row) {
                row.selectable(selectable);
            }
        });
    }

    private getRowByObject(object: any): Row {
        return this.rows.filter((r) => r.getRowObject() !== null && typeof r.getRowObject() !== 'undefined')
            .find((r) => r.getRowObject().getObject() && r.getRowObject().getObject().equals(object));
    }

    public getRowSelectionState(all?: boolean): SelectionState {
        const selectableCount = this.getRows(all).filter((r) => r.isSelectable()).length;
        const selectedCount = this.getRows(all).filter((r) => r.isSelected()).length;
        let selectionState = SelectionState.ALL;
        if (selectedCount < selectableCount) {
            selectionState = SelectionState.INDETERMINATE;
        }
        if (selectedCount === 0) {
            selectionState = SelectionState.NONE;
        }
        return selectionState;
    }

    public reload(
        keepSelection: boolean = false, sort: boolean = true, relevantHandlerConfigIds?: string[]
    ): Promise<void> {
        if (this.reloadPromise) {
            return this.reloadPromise;
        }

        this.reloadPromise = new Promise<void>(async (resolve, reject) => {
            EventService.getInstance().publish(TableEvent.RELOAD, new TableEventData(this.getTableId()));
            let selectedRows: Row[] = [];
            if (keepSelection) {
                selectedRows = this.getSelectedRows(true);
            }
            await this.loadRowData(relevantHandlerConfigIds);
            if (this.columns && !!this.columns.length) {
                this.columns.forEach((c) =>
                    this.rows.forEach((r) => {
                        r.addCell(new TableValue(c.getColumnId(), null));
                    })
                );
            }
            if (keepSelection && !!selectedRows.length) {
                // TODO: get selection without object
                selectedRows.map(
                    (r) => r.getRowObject().getObject()
                ).forEach(
                    (o) => this.selectRowByObject(o)
                );
            }

            if (sort && this.sortColumnId && this.sortOrder) {
                await this.sort(this.sortColumnId, this.sortOrder);
            }

            this.rows.forEach((r) => {
                r.initializeDisplayValues();
            });

            EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
            EventService.getInstance().publish(TableEvent.RELOADED, new TableEventData(this.getTableId()));

            resolve();
            this.reloadPromise = null;
        });

        return this.reloadPromise;
    }

    public switchColumnOrder(): void {
        this.columns = this.columns.reverse();
        if (this.getTableConfiguration().fixedFirstColumn) {
            const column = this.columns.splice(this.columns.length - 1, 1);
            this.columns.unshift(column[0]);
        }

        EventService.getInstance().publish(TableEvent.RERENDER_TABLE, new TableEventData(this.getTableId()));
    }

    public resetFilter(): void {
        this.setFilter(null, null);
        this.getColumns().forEach((c) => c.filter(null, null));
    }

    public isFiltered(): boolean {
        return this.isFilterDefined(this.filterValue, this.filterCriteria) ||
            this.getColumns().some((c) => c.isFiltered());
    }

    public async updateRowObject(object: KIXObject): Promise<void> {
        const row = this.getRowByObject(object);
        if (row) {
            row.getRowObject().updateObject(object);
            for (const c of row.getCells()) {
                await c.getDisplayValue(true);
            }
            EventService.getInstance().publish(
                TableEvent.ROW_VALUE_CHANGED,
                new TableEventData(this.getTableId(), row.getRowId())
            );
        }
    }

    public async setRowObjectValues(values: Array<[any, [string, any]]>): Promise<void> {
        for (const v of values) {
            const row = this.getRowByObject(v[0]);
            if (row) {
                const value = v[1];
                row.getRowObject().addValue(new TableValue(value[0], value[1]));
                const cell = row.getCell(value[0]);
                if (cell) {
                    await cell.setValue(new TableValue(value[0], value[1]));
                } else {
                    row.addCell(new TableValue(value[0], value[1], value[1]));
                }
                EventService.getInstance().publish(
                    TableEvent.ROW_VALUE_CHANGED,
                    new TableEventData(this.getTableId(), row.getRowId())
                );
            }
        }
    }

    public setRowObjectValueState(objects: any[], state: ValueState): void {
        if (objects && !!objects.length) {
            objects.forEach((o) => {
                const row = this.getRowByObject(o);
                if (row) {
                    row.setValueState(state);
                }
            });
        }
    }

    public getRowByObjectId(objectId: string | number): Row {
        const row = this.rows.find((r) => {
            const object = r.getRowObject().getObject();
            return object && object.ObjectId === objectId;
        });
        return row;
    }

    public destroy(): void {
        this.contentProvider.destroy();
    }

    public getRowCount(all?: boolean): number {
        let count = 0;
        this.getRows(all).forEach((r) => count += r.getRowCount());
        return count;
    }

}
