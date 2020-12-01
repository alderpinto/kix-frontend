/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { FAQArticleProperty } from '../../../model/FAQArticleProperty';


import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

export class FAQContext extends Context {

    public static CONTEXT_ID: string = 'faq';

    public categoryId: number;

    public getIcon(): string {
        return 'kix-icon-faq';
    }

    public async getDisplayText(): Promise<string> {
        return 'FAQ Dashboard';
    }

    public async initContext(urlParams: URLSearchParams): Promise<void> {
        if (urlParams) {
            if (urlParams.has('categoryId') && !isNaN(Number(urlParams.get('categoryId')))) {
                this.categoryId = Number(urlParams.get('categoryId'));
            }
        }
    }
    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];

            const params = [];
            if (this.categoryId) {
                params.push(`categoryId=${this.categoryId}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public async setFAQCategoryId(categoryId: number): Promise<void> {
        if (!this.categoryId || this.categoryId !== categoryId) {
            this.categoryId = categoryId;
            await this.loadFAQArticles();
            this.listeners.forEach(
                (l) => l.objectChanged(this.categoryId, this.categoryId, KIXObjectType.FAQ_CATEGORY)
            );
            ContextService.getInstance().setDocumentHistory(true, false, this, this, null);
        }
    }

    private async loadFAQArticles(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, 1
                )
            ], null, 1000, [FAQArticleProperty.VOTES], [FAQArticleProperty.VOTES]
        );
        if (this.categoryId) {
            loadingOptions.filter.push(
                new FilterCriteria(
                    FAQArticleProperty.CATEGORY_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, this.categoryId
                )
            );
        }

        const faqArticles = await KIXObjectService.loadObjects(
            KIXObjectType.FAQ_ARTICLE, null, loadingOptions, null, false
        ).catch((error) => []);
        this.setObjectList(KIXObjectType.FAQ_ARTICLE, faqArticles);
    }

    public reset(): void {
        super.reset();
        this.categoryId = null;
        this.loadFAQArticles();
    }

    public reloadObjectList(objectType: KIXObjectType | string): Promise<void> {
        if (objectType === KIXObjectType.FAQ_ARTICLE) {
            return this.loadFAQArticles();
        }
    }

}
