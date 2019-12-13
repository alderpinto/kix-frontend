/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { SystemAddressLabelProvider, SystemAddressDetailsContext } from '../../core';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { SystemAddress } from '../../../model/SystemAddress';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new SystemAddressLabelProvider();
        const context = await ContextService.getInstance().getContext<SystemAddressDetailsContext>(
            SystemAddressDetailsContext.CONTEXT_ID
        );
        context.registerListener('system-address-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, systemAddress: SystemAddress, type: KIXObjectType) => {
                if (type === KIXObjectType.SYSTEM_ADDRESS) {
                    this.initWidget(systemAddress);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<SystemAddress>());
    }

    private async initWidget(systemAddress: SystemAddress): Promise<void> {
        this.state.systemAddress = systemAddress;
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.systemAddress) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.systemAddress]
            );
        }
    }

}

module.exports = Component;