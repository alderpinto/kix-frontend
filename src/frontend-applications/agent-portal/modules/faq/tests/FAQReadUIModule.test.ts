/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ContextFactory } from '../../base-components/webapp/core/ContextFactory';
import {
    FAQReadUIModule, FAQArticleSearchContext, FAQLabelProvider, FAQCategoryLabelProvider, FAQArticleHistoryLabelProvider, FAQArticleTableFactory, FAQArticleHistoryTableFactory, FAQArticleFormService, FAQArticleSearchDefinition
} from '../webapp/core';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';
import { FAQContext } from '../webapp/core/context/FAQContext';
import { FAQDetailsContext } from '../webapp/core/context/FAQDetailsContext';
import { LabelService } from '../../base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../base-components/webapp/core/table';
import { ServiceRegistry } from '../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../base-components/webapp/core/ServiceType';
import { SearchService } from '../../search/webapp/core';
import { TranslationService } from '../../translation/webapp/core/TranslationService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('FAQReadUIModule', () => {

    let faqModule: FAQReadUIModule;

    before(() => {
        faqModule = new FAQReadUIModule();
    });

    describe('Should register the edit module for faq', () => {

        it('should register', async () => {
            TranslationService.getUserLanguage = async (): Promise<string> => {
                return 'de';
            };
            await faqModule.register();
        });

        it('should register the context for FAQContext', () => {
            const descriptor = ContextFactory.getInstance().getContextDescriptor(FAQContext.CONTEXT_ID);
            expect(descriptor).exist;
        });

        it('should register the context for FAQDetailsContext', () => {
            const descriptor = ContextFactory.getInstance().getContextDescriptor(FAQDetailsContext.CONTEXT_ID);
            expect(descriptor).exist;
        });

        it('should register the context for FAQArticleSearchContext', () => {
            const descriptor = ContextFactory.getInstance().getContextDescriptor(FAQArticleSearchContext.CONTEXT_ID);
            expect(descriptor).exist;
        });

        it('should register FAQArticleVoteAction', () => {
            expect(ActionFactory.getInstance().hasAction('faq-article-vote-action')).true;
        });

        it('should register LoadFAQAricleAction', () => {
            expect(ActionFactory.getInstance().hasAction('load-faq-article-action')).true;
        });

        it('Should register the FAQLabelProvider', () => {
            const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.FAQ_ARTICLE);
            expect(provider).exist;
            expect(provider).instanceof(FAQLabelProvider);
        });

        it('Should register the FAQCategoryLabelProvider', () => {
            const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.FAQ_CATEGORY);
            expect(provider).exist;
            expect(provider).instanceof(FAQCategoryLabelProvider);
        });

        it('Should register the FAQArticleHistoryLabelProvider', () => {
            const provider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.FAQ_ARTICLE_HISTORY);
            expect(provider).exist;
            expect(provider).instanceof(FAQArticleHistoryLabelProvider);
        });

        it('Should register the FAQArticleTableFactory', () => {
            const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.FAQ_ARTICLE);
            expect(factory).exist;
            expect(factory).instanceof(FAQArticleTableFactory);
        });

        it('Should register the FAQArticleHistoryTableFactory', () => {
            const factory = TableFactoryService.getInstance().getTableFactory(KIXObjectType.FAQ_ARTICLE_HISTORY);
            expect(factory).exist;
            expect(factory).instanceof(FAQArticleHistoryTableFactory);
        });

        it('Should register the FAQArticleFormService', () => {
            const service = ServiceRegistry.getServiceInstance(KIXObjectType.FAQ_ARTICLE, ServiceType.FORM);
            expect(service).exist;
            expect(service).instanceof(FAQArticleFormService);
        });

        it('Should register the FAQArticleSearchDefinition', () => {
            const definition = SearchService.getInstance().getSearchDefinition(KIXObjectType.FAQ_ARTICLE);
            expect(definition).exist;
            expect(definition).instanceof(FAQArticleSearchDefinition);
        });

    });

});