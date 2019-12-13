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
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { RoleDetailsContext } from '../../core/admin';
import { Role } from '../../../model/Role';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../base-components/webapp/core/table';
import { DefaultColumnConfiguration } from '../../../../../server/services/configuration/DefaultColumnConfiguration';
import { UserProperty } from '../../../model/UserProperty';
import { DataType } from '../../../../../model/DataType';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<RoleDetailsContext>(
            RoleDetailsContext.CONTEXT_ID
        );

        context.registerListener('user-role-assigned-users-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ticketId: string, role: Role, type: KIXObjectType | string) => {
                if (type === KIXObjectType.ROLE) {
                    this.initWidget(role);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<Role>());
    }

    public onDestroy(): void {
        TableFactoryService.getInstance().destroyTable('user-role-assigned-users');
    }

    private async initWidget(role: Role): Promise<void> {
        if (role) {
            const columns = [
                new DefaultColumnConfiguration(null, null, null,
                    UserProperty.USER_LOGIN, true, false, true, false, 250, true, true, false,
                    DataType.STRING, true, null, null, false
                ),
                new DefaultColumnConfiguration(null, null, null,
                    UserProperty.USER_FIRSTNAME, true, false, true, false, 250, true, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    UserProperty.USER_LASTNAME, true, false, true, false, 250, true, true, false,
                    DataType.STRING, true, null, null, false
                ),
                new DefaultColumnConfiguration(null, null, null,
                    UserProperty.USER_EMAIL, true, false, true, false, 250, true, true, true
                ),
                new DefaultColumnConfiguration(
                    null, null, null, KIXObjectProperty.VALID_ID, true, false, true, false, 100, true, true
                )
            ];
            const tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.USER, null, 32, columns, [], false, false, null, null,
                TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
            const table = await TableFactoryService.getInstance().createTable(
                'user-role-assigned-users', KIXObjectType.USER, tableConfiguration, null,
                RoleDetailsContext.CONTEXT_ID, true, undefined, false, true, true
            );
            this.state.table = table;
            this.prepareActions(role);
            this.prepareTitle(role);
        }
    }

    private async prepareTitle(role: Role): Promise<void> {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        title = await TranslationService.translate(title);
        const count = role.UserIDs ? role.UserIDs.length : 0;
        this.state.title = `${title} (${count})`;
    }

    private async prepareActions(role: Role): Promise<void> {
        if (this.state.widgetConfiguration && role) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [role]
            );
        }
    }

}

module.exports = Component;