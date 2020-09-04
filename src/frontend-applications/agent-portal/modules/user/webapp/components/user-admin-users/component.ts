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
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { ActionFactory } from '../../../../base-components/webapp/core/ActionFactory';
import { WidgetService } from '../../../../base-components/webapp/core/WidgetService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { TableFactoryService, TableEventData, TableEvent, TableContentProvider, TableValue, RowObject } from '../../../../base-components/webapp/core/table';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { UserProperty } from '../../../model/UserProperty';
import { AgentService } from '../../core';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { User } from '../../../model/User';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;
    public filterValue: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await this.prepareTable();

        const actions = await ActionFactory.getInstance().generateActions(
            ['user-admin-user-create-action', 'csv-export-action'], this.state.table
        );
        WidgetService.getInstance().registerActions(this.state.instanceId, actions);

        this.state.placeholder = await TranslationService.translate('Translatable#Please enter a search term.');
        this.state.translations = await TranslationService.createTranslationObject(['Translatable#Users']);
        this.state.prepared = true;
    }

    private async prepareTable(): Promise<void> {

        const tableConfiguration = new TableConfiguration(
            null, null, null,
            KIXObjectType.USER,
            new KIXObjectLoadingOptions(null, null, null, [UserProperty.PREFERENCES]),
            null, undefined, [], true, false, null, null,
            TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );

        this.state.table = await TableFactoryService.getInstance().createTable(
            this.state.instanceId, KIXObjectType.USER, tableConfiguration, [],
            null, true, null, false, false
        );

        this.state.table.setContentProvider(new UserContentProvider(this));

        this.subscriber = {
            eventSubscriberId: 'admin-users',
            eventPublished: (data: TableEventData, eventId: string) => {
                if (data && this.state.table && data.tableId === this.state.table.getTableId()) {
                    WidgetService.getInstance().updateActions(this.state.instanceId);
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);

        await this.state.table.initialize();
    }

    public keyUp(event: any): void {
        this.filterValue = event.target.value;
        if (event.key === 'Enter') {
            this.search();
        }
    }

    public search(): void {
        this.state.filterValue = this.filterValue;
        this.state.table.reload(true);

    }

}

// tslint:disable-next-line:max-classes-per-file
class UserContentProvider extends TableContentProvider {

    public constructor(private component: Component) {
        super(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, component.state.table, [], null);
    }

    public async loadData(): Promise<Array<RowObject<User>>> {
        const rowObjects = [];
        if (this.component.filterValue && this.component.filterValue !== '') {
            const filter = await AgentService.getInstance().prepareFullTextFilter(this.component.filterValue);
            const loadingOptions = new KIXObjectLoadingOptions(filter);

            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, null, loadingOptions
            );


            for (const u of users) {
                const rowObject = await this.createRowObject(u);
                rowObjects.push(rowObject);
            }
        }

        this.component.state.title = await TranslationService.translate(
            'Translatable#User Management: Users ({0})', [rowObjects.length]
        );

        return rowObjects;
    }

    private async createRowObject(user: User): Promise<RowObject> {
        const values: TableValue[] = [];

        const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
        for (const column of columns) {
            const tableValue = new TableValue(column.property, user[column.property]);
            values.push(tableValue);
        }

        const rowObject = new RowObject<User>(values, user);
        return rowObject;
    }

}

module.exports = Component;
