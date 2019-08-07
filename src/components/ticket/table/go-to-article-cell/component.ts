/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ContextService } from '../../../../core/browser';
import { EventService } from '../../../../core/browser/event';
import { TicketEvent, ContextType, KIXObjectType } from '../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.cell = input.cell;
        if (this.state.cell) {
            const value = this.state.cell.getValue().objectValue;
            this.state.isActive = value !== undefined && value !== null && value !== 0;
        }
    }

    public goToArticleClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        if (context) {
            context.provideScrollInformation(KIXObjectType.ARTICLE, this.state.cell.getValue().objectValue);
        }
    }

}

module.exports = Component;
