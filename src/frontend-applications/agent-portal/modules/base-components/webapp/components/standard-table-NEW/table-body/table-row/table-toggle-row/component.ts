/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { IEventSubscriber } from '../../../../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { ToggleOptions, TableEvent, TableEventData } from '../../../../../core/table';
import { ContextService } from '../../../../../../../../modules/base-components/webapp/core/ContextService';
import { EventService } from '../../../../../../../../modules/base-components/webapp/core/EventService';
import { BrowserUtil } from '../../../../../../../../modules/base-components/webapp/core/BrowserUtil';
import { ActionFactory } from '../../../../../../../../modules/base-components/webapp/core/ActionFactory';
import { KIXModulesService } from '../../../../../../../../modules/base-components/webapp/core/KIXModulesService';
import { IdService } from '../../../../../../../../model/IdService';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    private toggleOptions: ToggleOptions;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.loading = true;

        setTimeout(() => {
            this.state.row = input.row;
            if (this.state.row) {
                this.toggleOptions = this.state.row.getTable().getTableConfiguration().toggleOptions;
                if (this.toggleOptions) {
                    this.setToggleActions();
                }
                this.setWidth();
            }

            this.state.loading = false;
        }, 10);
    }

    public async onMount(): Promise<void> {
        this.setWidth();
        const context = ContextService.getInstance().getActiveContext();
        const listenerId = this.state.row ? this.state.row.getRowId() : IdService.generateDateBasedId();
        context.registerListener((listenerId + '-toggle'), {
            sidebarToggled: () => { this.setWidth(); },
            explorerBarToggled: () => { this.setWidth(); },
            objectChanged: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: () => { return; }
        });
        window.addEventListener('resize', this.setWidth.bind(this), false);
        this.eventSubscriberId = listenerId;
        EventService.getInstance().subscribe(TableEvent.REFRESH, this);

        await this.setToggleActions();
        setTimeout(() => this.state.loading = false, 50);
    }

    public onDestroy(): void {
        window.removeEventListener('resize', this.setWidth.bind(this), false);
        EventService.getInstance().unsubscribe(TableEvent.REFRESH, this);
    }

    public eventPublished(data: TableEventData, eventId: string, subscriberId?: string): void {
        if (eventId === TableEvent.REFRESH
            && this.state.row
            && data
            && data.tableId === this.state.row.getTable().getTableId()
        ) {
            this.setWidth();
        }
    }

    private setWidth(): void {
        setTimeout(() => {
            const root = (this as any).getEl();
            let width;
            if (root) {
                let container = root.parentNode;
                while (container && container.className !== 'table-container') {
                    container = container.parentNode ? container.parentNode : null;
                }
                if (container) {
                    width = container.clientWidth - 2.5 * BrowserUtil.getBrowserFontsize();
                }
            }
            this.state.width = (width ? width + 'px' : '100%');
        }, 70);
    }

    public async setToggleActions(): Promise<void> {
        let actions = this.toggleOptions && this.state.row
            ? await ActionFactory.getInstance().generateActions(
                this.toggleOptions.actions, [this.state.row.getRowObject().getObject()]
            )
            : [];

        if (this.state.row) {
            const context = ContextService.getInstance().getActiveContext();
            const object = this.state.row.getRowObject().getObject();
            const objectActions = await context.getAdditionalActions(object);

            actions = [...objectActions, ...actions];
        }
        const filteredActions = [];
        for (const a of actions) {
            if (await a.canShow()) {
                filteredActions.push(a);
            }
        }
        this.state.actions = filteredActions;
    }

    public calculateToggleContentMinHeight(index: number): string {
        const minHeight = '10em'; // TODO: echten Wert ermitteln .toggle-row > td >.content
        setTimeout(async () => {
            if (this.state.actions && this.state.actions.length > 5) {
                const root = (this as any).getEl();
                if (root) {
                    const actionList = root.querySelector('ul.toggle-actions');
                    if (actionList) {
                        const computedHeight = getComputedStyle(actionList).height;
                        const rowContent = (this as any).getEl('row-toggle-content');
                        if (rowContent && computedHeight) {
                            rowContent.style.minHeight = computedHeight;
                        }
                    }
                }
            }
        }, 10);

        return minHeight;
    }

    public getToggleTemplate(): any {
        return this.toggleOptions && this.toggleOptions.componentId ?
            KIXModulesService.getComponentTemplate(this.toggleOptions.componentId) : undefined;
    }

    public getToggleInput(): any {
        let toggleInput = {};
        if (this.state.row && this.toggleOptions) {
            let data = this.state.row.getRowObject().getObject();
            if (this.toggleOptions.rowObjectProperty) {
                data = data ? data[this.toggleOptions.rowObjectProperty] : data;
            }

            if (this.toggleOptions.inputPropertyName) {
                toggleInput[this.toggleOptions.inputPropertyName] = data;
            } else {
                toggleInput = data;
            }

            if (this.toggleOptions.data) {
                toggleInput = {
                    ...toggleInput,
                    ...this.toggleOptions.data
                };
            }
        }
        return toggleInput;
    }
}

module.exports = Component;
