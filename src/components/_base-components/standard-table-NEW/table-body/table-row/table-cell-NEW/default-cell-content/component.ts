/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../../../core/browser';

class Component extends AbstractMarkoComponent<ComponentState> {

    public showIcons: boolean = true;
    public showText: boolean = true;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.loading = true;
        this.state.cell = input.cell;
        this.update();
    }

    private async update(): Promise<void> {
        if (this.state.cell) {
            const config = this.state.cell.getColumnConfiguration();
            if (config) {
                this.showIcons = config.showIcon;
                this.showText = config.showText;
            }
            await this.loadDisplayValues();
        }
        this.state.loading = false;
    }

    public async onMount(): Promise<void> {
        await this.loadDisplayValues();
        this.state.loading = false;
    }

    private async loadDisplayValues(): Promise<void> {
        if (this.state.cell) {
            if (this.showIcons) {
                if (this.state.cell.getValue().displayIcons) {
                    this.state.icons = this.state.cell.getValue().displayIcons;
                } else {
                    this.state.icons = await this.state.cell.getDisplayIcons();
                }
            }

            if (this.state.cell.getValue().displayValue) {
                this.state.displayText = this.state.cell.getValue().displayValue;
            } else {
                this.state.displayText = await this.state.cell.getDisplayValue();
            }
        }
    }

    public onDestroy(): void {
        // nothing
    }
}

module.exports = Component;
