/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Contact } from '../../../model/Contact';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../base-components/webapp/core/table';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('contact-assigned-organisations-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (contactId: string, contact: Contact, type: KIXObjectType) => {
                if (type === KIXObjectType.CONTACT) {
                    this.initWidget(contact);
                }
            },
            additionalInformationChanged: () => { return; }
        });

        this.initWidget(await context.getObject<Contact>());
    }

    public onDestroy(): void {
        TableFactoryService.getInstance().destroyTable('contact-assigned-organisation');
    }

    private async initWidget(contact?: Contact): Promise<void> {
        this.state.contact = contact;
        const title = await TranslationService.translate(this.state.widgetConfiguration.title);
        this.state.title = title
            + (this.state.contact.OrganisationIDs && !!this.state.contact.OrganisationIDs.length ?
                ` (${this.state.contact.OrganisationIDs.length})` : '');
        this.prepareTable();
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.contact) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.contact]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        if (this.state.contact && this.state.widgetConfiguration) {
            this.state.table = await TableFactoryService.getInstance().createTable(
                'contact-assigned-organisation', KIXObjectType.ORGANISATION,
                this.state.widgetConfiguration.configuration, this.state.contact.OrganisationIDs,
                null, true
            );
        }
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }
}

module.exports = Component;
