/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../core/browser';
import { TableConfiguration } from '../../../../core/browser/table';

class Component extends AbstractMarkoComponent<ComponentState> {

    public columnLength: number = 0;
    public selectionEnabled: boolean;
    public toggleEnabled: boolean;

    private tableConfig: TableConfiguration;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.rows = input.rows;
        this.columnLength = input.columnLength ? input.columnLength : 0;
        this.tableConfig = input.tableConfig;
        this.selectionEnabled = this.tableConfig ? this.tableConfig.enableSelection : null;
        this.toggleEnabled = this.tableConfig ? this.tableConfig.toggle : null;
    }

    public async onMount(): Promise<void> {
        // nothing
    }

    public onDestroy(): void {
        // nothing
    }

    public getFullColumnLength(): number {
        let columnLength = this.columnLength + 1;
        if (this.selectionEnabled) {
            columnLength++;
        }
        if (this.toggleEnabled) {
            columnLength++;
        }
        return columnLength;
    }

    public getEmptyString(): string {
        return this.tableConfig ? this.tableConfig.emptyResultHint : 'Translatable#No objects available.';
    }

    public getRowHeight(): string {
        return (this.tableConfig ? this.tableConfig.rowHeight : 1.75) + 'rem';
    }
}

module.exports = Component;
