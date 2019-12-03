/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService, ActionFactory } from '../../../../core/browser';
import { KIXObjectType, ContextType, ContextMode, ContextDescriptor } from '../../../../core/model';
import {
    NewFAQArticleDialogContext, FAQArticleEditAction, FAQArticleDeleteAction,
    FAQArticleCreateAction, EditFAQArticleDialogContext
} from '../../../../core/browser/faq';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 402;

    public name: string = 'FAQEditUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }


    public async register(): Promise<void> {
        await this.registerContexts();
        this.registerActions();
    }

    private async registerContexts(): Promise<void> {
        const newFAQArticleContext = new ContextDescriptor(
            NewFAQArticleDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.CREATE,
            false, 'new-faq-article-dialog', ['faqarticles'], NewFAQArticleDialogContext
        );
        await ContextService.getInstance().registerContext(newFAQArticleContext);

        const editFAQArticleContext = new ContextDescriptor(
            EditFAQArticleDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.EDIT,
            false, 'edit-faq-article-dialog', ['faqarticles'], EditFAQArticleDialogContext
        );
        await ContextService.getInstance().registerContext(editFAQArticleContext);
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('faq-article-create-action', FAQArticleCreateAction);
        ActionFactory.getInstance().registerAction('faq-article-delete-action', FAQArticleDeleteAction);
        ActionFactory.getInstance().registerAction('faq-article-edit-action', FAQArticleEditAction);
    }

}
