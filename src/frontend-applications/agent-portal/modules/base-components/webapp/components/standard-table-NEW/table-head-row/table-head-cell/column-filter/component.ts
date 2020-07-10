/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    AbstractMarkoComponent
} from '../../../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { IEventSubscriber } from '../../../../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { IColumn, TableEvent, TableEventData } from '../../../../../core/table';
import { EventService } from '../../../../../../../../modules/base-components/webapp/core/EventService';
import { OverlayService } from '../../../../../../../../modules/base-components/webapp/core/OverlayService';
import { ComponentContent } from '../../../../../../../../modules/base-components/webapp/core/ComponentContent';
import { OverlayType } from '../../../../../../../../modules/base-components/webapp/core/OverlayType';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    private column: IColumn;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.column = input.column;
    }

    public async onMount(): Promise<void> {
        if (this.column) {
            this.eventSubscriberId = this.column.getTable().getTableId() + '-' + this.column.getColumnId();
            EventService.getInstance().subscribe(TableEvent.COLUMN_FILTERED, this);
            this.setActiveState();

            const overlayIconListener = {
                overlayOpened: () => {
                    this.state.show = true;
                    (this as any).emit('changeFilterShownState', true);
                },
                overlayClosed: () => {
                    this.state.show = false;
                    (this as any).emit('changeFilterShownState', false);
                }
            };
            OverlayService.getInstance().registerOverlayListener(this.eventSubscriberId, overlayIconListener);
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.COLUMN_FILTERED, this);
        OverlayService.getInstance().unregisterOverlayListener(this.column.getColumnId());
    }

    public eventPublished(data: TableEventData, eventId: string, subscriberId?: string): void {
        if (eventId === TableEvent.COLUMN_FILTERED && data && data.tableId === this.column.getTable().getTableId()) {
            this.setActiveState();
        }
    }

    private setActiveState(): void {
        const filter = this.column.getFilter();
        this.state.active = ((filter[0] && filter[0] !== '') || (filter[1] && !!filter[1].length));
    }

    public async showFilter(event: any): Promise<void> {
        if (this.column && !this.state.show) {
            const content = new ComponentContent(
                'table-column-filter-overlay', { column: this.column }
            );

            let position: [number, number];
            const root = (this as any).getEl();
            if (root) {
                let cell = root.parentNode;
                while (cell && cell.className !== 'table-head-cell') {
                    cell = cell.parentNode ? cell.parentNode : null;
                }
                if (cell) {
                    const boundings: DOMRect = cell.getBoundingClientRect();
                    position = [boundings.left, boundings.bottom];
                }
            }
            OverlayService.getInstance().openOverlay(
                OverlayType.TABLE_COLUMN_FILTER, null, content, '', null, false,
                position, this.eventSubscriberId
            );
        }
    }

    public filterEntered(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('filterHovered', true);
    }

    public filterLeaved(event): void {
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('filterHovered', false);
    }
}

module.exports = Component;
