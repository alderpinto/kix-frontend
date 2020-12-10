/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Row } from './Row';
import { LabelService } from '../LabelService';
import { TableValue } from './TableValue';
import { UIFilterCriterion } from '../../../../../model/UIFilterCriterion';
import { FilterUtil } from '../FilterUtil';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';

export class Cell {

    private loadingPromise: Promise<string>;

    public constructor(
        private row: Row,
        private tableValue: TableValue
    ) { }

    public initDisplayValue(): void {
        this.tableValue.initDisplayValue(this);
    }

    public getRow(): Row {
        return this.row;
    }

    public getProperty(): string {
        return this.tableValue.property;
    }

    public getValue(): TableValue {
        return this.tableValue;
    }

    public setValue(value: TableValue): void {
        this.tableValue = value;
    }

    public async getDisplayValue(): Promise<string> {
        if (this.getValue().displayValue) {
            return this.getValue().displayValue;
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = new Promise<string>(async (resolve, reject) => {

            let value: string;
            const object = this.getRow().getRowObject().getObject();

            const columnConfiguration = this.getColumnConfiguration();
            const translatable = columnConfiguration ? columnConfiguration.translatable : true;

            if (object) {
                value = await LabelService.getInstance().getDisplayText(
                    object, this.tableValue.property, null, translatable
                );
            } else {
                const objectType = this.getRow().getTable().getObjectType();
                value = await LabelService.getInstance().getPropertyValueDisplayText(
                    objectType,
                    this.tableValue.property,
                    this.tableValue.objectValue ? this.tableValue.objectValue.toString() : null,
                    translatable
                );
            }
            this.getValue().displayValue = value;

            resolve(value);
            this.loadingPromise = null;
        });

        return this.loadingPromise;
    }

    public async filter(filterValue: string, criteria: UIFilterCriterion[]): Promise<boolean> {
        const matchTextFilter = await this.matchDisplayValue(filterValue);
        const matchCriteria = await this.matchCriteria(criteria);
        return matchTextFilter && matchCriteria;
    }

    private matchDisplayValue(filterValue: string): boolean {
        if (!filterValue || filterValue === '') {
            return true;
        }

        return FilterUtil.stringContains(this.tableValue.displayValue, filterValue);
    }

    private async matchCriteria(criteria: UIFilterCriterion[]): Promise<boolean> {

        if (!criteria || criteria.length === 0) {
            return true;
        }

        const filterCriteria = criteria.filter((c) => c.property === this.tableValue.property);

        if (filterCriteria.length === 0) {
            return false;
        }

        let match = false;

        const matchPromises = [];
        filterCriteria.forEach((c) => matchPromises.push(
            FilterUtil.checkUIFilterCriterion(
                c.value, c.operator, c.useDisplayValue ? this.tableValue.displayValue : this.tableValue.objectValue
            )
        ));

        const result = await Promise.all<boolean>(matchPromises);
        match = result.every((r) => r);

        return match;
    }

    public getColumnConfiguration(): IColumnConfiguration {
        const table = this.row ? this.row.getTable() : null;
        const column = table ? table.getColumn(this.tableValue.property) : null;
        return column ? column.getColumnConfiguration() : null;
    }
}
