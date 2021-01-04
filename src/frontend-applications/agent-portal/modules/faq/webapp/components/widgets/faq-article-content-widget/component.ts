/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../../model/IdService';
import { WidgetService } from '../../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../../model/configuration/WidgetType';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { FAQDetailsContext } from '../../../core/context/FAQDetailsContext';
import { FAQArticle } from '../../../../model/FAQArticle';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { FAQService } from '../../../core';
import { LabelService } from '../../../../../../modules/base-components/webapp/core/LabelService';
import { FAQArticleProperty } from '../../../../model/FAQArticleProperty';
import { BrowserUtil } from '../../../../../../modules/base-components/webapp/core/BrowserUtil';
import { ActionFactory } from '../../../../../../modules/base-components/webapp/core/ActionFactory';
import { Attachment } from '../../../../../../model/kix/Attachment';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { FAQArticleAttachmentLoadingOptions } from '../../../../model/FAQArticleAttachmentLoadingOptions';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';
import { Context } from '../../../../../../model/Context';
import { DisplayImageDescription } from '../../../../../base-components/webapp/core/DisplayImageDescription';
import { DialogService } from '../../../../../base-components/webapp/core/DialogService';

class Component {

    public eventSubscriberId: string = 'FAQContentComponent';

    private state: ComponentState;
    private contextListenerId: string = null;

    public stars: Array<string | ObjectIcon> = [];
    public rating: number;
    private images: DisplayImageDescription[];

    public onCreate(): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('faq-content-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Symptom', 'Translatable#Cause', 'Translatable#Solution', 'Translatable#Comment',
            'Translatable#Number of ratings'
        ]);

        WidgetService.getInstance().setWidgetType('faq-article-group', WidgetType.GROUP);

        const context = await ContextService.getInstance().getContext<FAQDetailsContext>(FAQDetailsContext.CONTEXT_ID);
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, faqArticle: FAQArticle, type: KIXObjectType | string) => {
                if (type === KIXObjectType.FAQ_ARTICLE) {
                    this.initWidget(context, faqArticle);
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: () => { return; }
        });

        await this.initWidget(context, await context.getObject<FAQArticle>());
        this.state.loading = false;
    }

    private async initWidget(context: Context, faqArticle?: FAQArticle): Promise<void> {
        this.state.faqArticle = faqArticle;

        if (faqArticle && faqArticle.Attachments) {
            this.state.attachments = faqArticle.Attachments.filter((a) => a.Disposition !== 'inline');
            this.state.inlineContent = await FAQService.getInstance().getFAQArticleInlineContent(faqArticle);
            this.prepareImages();

            this.stars = await LabelService.getInstance().getIcons(faqArticle, FAQArticleProperty.VOTES);
            this.rating = BrowserUtil.calculateAverage(faqArticle.Votes.map((v) => v.Rating));
            this.prepareActions();
        }
    }

    private async prepareImages() {
        const attachmentPromises: Array<Promise<DisplayImageDescription>> = [];
        const imageAttachments = this.state.attachments.filter((a) => a.ContentType.match(/^image\//));
        if (imageAttachments && imageAttachments.length) {
            for (const imageAttachment of imageAttachments) {
                attachmentPromises.push(new Promise<DisplayImageDescription>(async (resolve, reject) => {
                    const attachment = await this.loadAttachment(imageAttachment, true).catch(() => null);
                    if (attachment) {
                        const content = `data:${attachment.ContentType};base64,${attachment.Content}`;
                        resolve(new DisplayImageDescription(
                            attachment.ID, content, attachment.Comment ? attachment.Comment : attachment.Filename
                        ));
                    }
                    resolve();
                }));
            }
        }
        this.images = (await Promise.all(attachmentPromises)).filter((i) => i);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.faqArticle) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.faqArticle]
            );
        }
    }

    public getRatingTooltip(): string {
        const count = this.state.faqArticle.Votes ? this.state.faqArticle.Votes.length : 0;
        return `${this.state.translations['Translatable#Number of ratings']}: ${count}`;
    }

    public getIcon(attachment: Attachment): ObjectIcon {
        const fileName = attachment.Filename;
        const idx = fileName.lastIndexOf('.');
        if (idx >= 0) {
            const extension = fileName.substring(idx + 1, fileName.length);
            return new ObjectIcon(null, 'Filetype', extension);
        }
        return null;
    }

    public async download(attachment: Attachment): Promise<void> {
        if (this.images && this.images.some((i) => i.imageId === attachment.ID)) {
            DialogService.getInstance().openImageDialog(this.images, attachment.ID);
        } else {
            const attachmentWithContent = await this.loadAttachment(attachment);
            if (attachmentWithContent) {
                if (attachmentWithContent.ContentType === 'application/pdf') {
                    BrowserUtil.openPDF(attachmentWithContent.Content, attachmentWithContent.Filename);
                } else {
                    BrowserUtil.startBrowserDownload(
                        attachmentWithContent.Filename, attachmentWithContent.Content,
                        attachmentWithContent.ContentType
                    );
                }
            }
        }
    }

    private async loadAttachment(attachment: Attachment, silent?: boolean) {
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, ['Content']);
        const faqArticleAttachmentOptions = new FAQArticleAttachmentLoadingOptions(
            this.state.faqArticle.ID, attachment.ID
        );
        const attachments = await KIXObjectService.loadObjects<Attachment>(
            KIXObjectType.FAQ_ARTICLE_ATTACHMENT, [attachment.ID], loadingOptions, faqArticleAttachmentOptions, silent
        ).catch(() => [] as Attachment[]);
        return attachments && attachments.length ? attachments[0] : null;
    }
}

module.exports = Component;
