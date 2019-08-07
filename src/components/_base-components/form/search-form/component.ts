/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    WidgetType, KIXObject, SearchFormInstance, FilterCriteria, ISearchFormListener, CacheState, Error, KIXObjectType
} from '../../../../core/model';
import { FormService } from '../../../../core/browser/form';
import {
    WidgetService, IdService, TableConfiguration, TableHeaderHeight,
    TableRowHeight, BrowserUtil, ITable, TableFactoryService, TableEvent, SearchProperty, TableEventData
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { SearchContext } from '../../../../core/browser/search/context/SearchContext';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../core/browser/components/dialog';
import { SearchService } from '../../../../core/browser/kix/search/SearchService';

class Component implements ISearchFormListener {

    private state: ComponentState;
    private formId: string;
    private objectType: KIXObjectType;

    public listenerId: string;

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = IdService.generateDateBasedId('search-form-');
        WidgetService.getInstance().setWidgetType('search-form-group', WidgetType.GROUP);
    }

    public onInput(input: any) {
        this.formId = input.formId;
        this.objectType = input.objectType;
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Attributes", "Translatable#Reset data", "Translatable#Cancel",
            "Translatable#Detailed search results", "Translatable#Start search"
        ]);

        this.state.table = await this.createTable();

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.registerSearchFormListener(this);
        }

        if (SearchService.getInstance().getSearchCache()) {
            const cache = SearchService.getInstance().getSearchCache();
            if (cache.status === CacheState.VALID && cache.objectType === this.objectType) {
                SearchService.getInstance().provideResult();
                await this.setCanSearch();
            } else {
                this.reset();
            }
        }

        this.subscriber = {
            eventSubscriberId: 'search-result-list',
            eventPublished: async (data: TableEventData, eventId: string) => {
                if (this.state.table) {
                    if (data && data.tableId === this.state.table.getTableId()) {
                        if (eventId === TableEvent.TABLE_INITIALIZED) {
                            await this.setAdditionalColumns();
                        }
                    }
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.subscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);
    }

    public async onDestroy(): Promise<void> {
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.removeSearchFormListener(this.listenerId);
        }
        const cache = SearchService.getInstance().getSearchCache();
        if (cache) {
            cache.status = CacheState.VALID;
        }
    }

    public keyDown(event: any): void {
        if ((event.keyCode === 13 || event.key === 'Enter') && this.state.canSearch) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            this.search();
        }
    }

    public formReseted(): void {
        return;
    }

    public async reset(): Promise<void> {
        const cache = SearchService.getInstance().getSearchCache();
        if (cache) {
            cache.status = CacheState.INVALID;
        }

        SearchService.getInstance().provideResult([]);

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.reset();
        }
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async search(): Promise<void> {
        const hint = await TranslationService.translate('Translatable#Search');
        DialogService.getInstance().setMainDialogLoading(true, hint, true);

        const result = await SearchService.getInstance().executeSearch<KIXObject>(this.formId)
            .catch((error: Error) => {
                BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
            });

        await this.setAdditionalColumns();

        this.state.resultCount = Array.isArray(result) ? result.length : 0;
        (this as any).setStateDirty();

        DialogService.getInstance().setMainDialogLoading(false);
    }

    private async setAdditionalColumns(): Promise<void> {
        const searchCache = SearchService.getInstance().getSearchCache();
        const parameter: Array<[string, any]> = [];
        if (searchCache && searchCache.status === CacheState.VALID && searchCache.objectType === this.objectType) {
            for (const c of searchCache.criteria) {
                if (c.property !== SearchProperty.FULLTEXT) {
                    parameter.push([c.property, c.value]);
                }
            }
        }

        const searchDefinition = SearchService.getInstance().getSearchDefinition(this.objectType);
        const columns = await searchDefinition.getTableColumnConfiguration(parameter);
        this.state.table.addColumns(columns);
    }

    public submit(): void {
        if (this.state.resultCount) {
            DialogService.getInstance().submitMainDialog();
        }
    }

    public removeValue(): void {
        return;
    }

    private async setCanSearch(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            this.state.canSearch = formInstance.getCriteria().some(
                (c) => c.property !== null && c.operator !== null
                    && c.value !== null && c.value !== '' && !/^\s+$/.test(c.value.toString())
            );
        }
    }

    public async searchCriteriaChanged(criteria: FilterCriteria[]): Promise<void> {
        await this.setCanSearch();
    }

    private async createTable(): Promise<ITable> {
        const tableConfiguration = new TableConfiguration(
            this.objectType, null, null, null, false, false, null, null,
            TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            `search-form-results-${this.objectType}`, this.objectType, tableConfiguration,
            null, SearchContext.CONTEXT_ID, true, false, true
        );

        SearchService.getInstance().provideResult();

        return table;
    }
}

module.exports = Component;
