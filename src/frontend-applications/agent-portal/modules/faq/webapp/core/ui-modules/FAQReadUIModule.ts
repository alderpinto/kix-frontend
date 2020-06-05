/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../../model/IUIModule';
import { FactoryService } from '../../../../../modules/base-components/webapp/core/FactoryService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import {
    FAQArticleBrowserFactory, FAQArticleAttachmentBrowserFactory, FAQArticleTableFactory, FAQArticleHistoryTableFactory,
    FAQLabelProvider, FAQCategoryLabelProvider, FAQArticleHistoryLabelProvider, FAQService, FAQArticleFormService,
    FAQArticleSearchDefinition, FAQArticleSearchContext, FAQArticleVoteAction, LoadFAQAricleAction
} from '..';
import { FAQCategoryBrowserFactory } from '../FAQCategoryBrowserFactory';
import { TableFactoryService } from '../../../../base-components/webapp/core/table';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { SearchService } from '../../../../search/webapp/core';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { ContextDescriptor } from '../../../../../model/ContextDescriptor';
import { FAQContext } from '../context/FAQContext';
import { ContextType } from '../../../../../model/ContextType';
import { ContextMode } from '../../../../../model/ContextMode';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { FAQDetailsContext } from '../context/FAQDetailsContext';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { Bookmark } from '../../../../../model/Bookmark';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { BookmarkService } from '../../../../../modules/base-components/webapp/core/BookmarkService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FAQArticleVoteFormService } from '../FAQArticleVoteFormService';



export class UIModule implements IUIModule {

    public priority: number = 400;

    public name: string = 'FAQReadUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        FactoryService.getInstance().registerFactory(
            KIXObjectType.FAQ_ARTICLE, FAQArticleBrowserFactory.getInstance()
        );

        FactoryService.getInstance().registerFactory(
            KIXObjectType.FAQ_CATEGORY, FAQCategoryBrowserFactory.getInstance()
        );

        FactoryService.getInstance().registerFactory(
            KIXObjectType.FAQ_ARTICLE_ATTACHMENT, FAQArticleAttachmentBrowserFactory.getInstance()
        );

        TableFactoryService.getInstance().registerFactory(new FAQArticleTableFactory());
        TableFactoryService.getInstance().registerFactory(new FAQArticleHistoryTableFactory());

        LabelService.getInstance().registerLabelProvider(new FAQLabelProvider());
        LabelService.getInstance().registerLabelProvider(new FAQCategoryLabelProvider());
        LabelService.getInstance().registerLabelProvider(new FAQArticleHistoryLabelProvider());

        ServiceRegistry.registerServiceInstance(FAQService.getInstance());
        ServiceRegistry.registerServiceInstance(FAQArticleFormService.getInstance());
        ServiceRegistry.registerServiceInstance(FAQArticleVoteFormService.getInstance());

        SearchService.getInstance().registerSearchDefinition(new FAQArticleSearchDefinition());

        await this.registerContexts();
        this.registerActions();
        await this.registerBookmarks();

        EventService.getInstance().subscribe(ApplicationEvent.REFRESH, {
            eventSubscriberId: 'FAQReadUIModule',
            eventPublished: () => this.registerBookmarks()
        });
    }

    private async registerContexts(): Promise<void> {
        const faqContextDescriptor = new ContextDescriptor(
            FAQContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'faq', ['faqarticles'], FAQContext
        );
        await ContextService.getInstance().registerContext(faqContextDescriptor);

        const faqDetailsContextDescriptor = new ContextDescriptor(
            FAQDetailsContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['faqarticles'], FAQDetailsContext
        );
        await ContextService.getInstance().registerContext(faqDetailsContextDescriptor);

        const searchFAQArticleContext = new ContextDescriptor(
            FAQArticleSearchContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-faq-article-dialog', ['faqarticles'], FAQArticleSearchContext
        );
        await ContextService.getInstance().registerContext(searchFAQArticleContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('faq-article-vote-action', FAQArticleVoteAction);
        ActionFactory.getInstance().registerAction('load-faq-article-action', LoadFAQAricleAction);
    }

    private async registerBookmarks(): Promise<void> {
        const language = await TranslationService.getUserLanguage();

        const isGerman = language === 'de';

        const faqIds = [
            isGerman ? 1 : 2,
            isGerman ? 3 : 4,
            isGerman ? 5 : 6,
            isGerman ? 7 : 8,
        ];

        const bookmarks = [
            new Bookmark(
                'Translatable#General information on how to work with KIX 18',
                'kix-icon-faq', 'load-faq-article-action',
                faqIds[0],
                [new UIComponentPermission('faq/articles', [CRUD.READ])]
            ),
            new Bookmark(
                'Translatable#How do I search in KIX 18?', 'kix-icon-faq', 'load-faq-article-action', faqIds[1],
                [new UIComponentPermission('faq/articles', [CRUD.READ])]
            ),
            new Bookmark(
                'Translatable#How do I create a new ticket?', 'kix-icon-faq', 'load-faq-article-action', faqIds[3],
                [new UIComponentPermission('faq/articles', [CRUD.READ])]
            ),
            new Bookmark(
                'Translatable#Selected ticket functions', 'kix-icon-faq', 'load-faq-article-action', faqIds[2],
                [new UIComponentPermission('faq/articles', [CRUD.READ])]
            )
        ];

        BookmarkService.getInstance().publishBookmarks('faq', bookmarks);
    }

}
