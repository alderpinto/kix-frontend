/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { OrganisationContext } from '../../core';
import { OrganisationAdditionalInformationKeys } from '../../core/context/OrganisationContext';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private instanceId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<OrganisationContext>(
            OrganisationContext.CONTEXT_ID
        );

        if (context) {
            context.setAdditionalInformation(OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING, true);
            context.registerListener('contact-list-widget', {
                sidebarToggled: () => { return; },
                scrollInformationChanged: () => { return; },
                objectListChanged: () => { return; },
                objectChanged: () => { return; },
                filteredObjectListChanged: () => { return; },
                explorerBarToggled: () => { return; },
                additionalInformationChanged: (key: string, value: any) => {
                    this.setWidgetDependingMode();
                }
            });
        }

        this.state.filterActions = await ActionFactory.getInstance().generateActions(
            ['contact-table-depending-action']
        );

        this.setWidgetDependingMode();
        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        const context = await ContextService.getInstance().getContext<OrganisationContext>(
            OrganisationContext.CONTEXT_ID
        );
        if (context) {
            context.unregisterListener('contact-list-widget');
        }
    }

    private async setWidgetDependingMode(): Promise<void> {
        const context = await ContextService.getInstance().getContext<OrganisationContext>(
            OrganisationContext.CONTEXT_ID
        );

        if (context) {
            const depending = context.getAdditionalInformation(
                OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
            );

            if (typeof depending !== 'undefined' && depending) {
                WidgetService.getInstance().setWidgetTitle(this.instanceId, 'Translatable#Assigned Contacts');
                WidgetService.getInstance().setWidgetClasses(this.instanceId, ['depending-widget']);
            } else {
                WidgetService.getInstance().setWidgetTitle(this.instanceId, null);
                WidgetService.getInstance().setWidgetClasses(this.instanceId, []);
            }

            this.state.filterActions = await ActionFactory.getInstance().generateActions(
                ['contact-table-depending-action']
            );
            WidgetService.getInstance().updateActions(this.instanceId);
        }
    }

}

module.exports = Component;
