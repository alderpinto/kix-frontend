/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { Attachment } from '../../../../../../model/kix/Attachment';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { Article } from '../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { TicketService } from '../../TicketService';

export class ArticleAttachmentFormValue extends ObjectFormValue<string> {

    public options: Array<[string, any]> = [];

    public constructor(
        public property: string,
        object: any,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'attachment-form-input';
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);

        const multiUpload = field?.options.find((o) => o.option === 'MULTI_FILES');
        if (multiUpload) {
            this.options.push([multiUpload.option, multiUpload.value]);
        }

        const mimeTypes = field?.options.find((o) => o.option === 'MimeTypes');
        if (mimeTypes) {
            this.options.push([mimeTypes.option, mimeTypes.value]);
        }
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        const context = ContextService.getInstance().getActiveContext();
        const useRefArticleAttachments = context?.getAdditionalInformation('USE_REFERENCED_ATTACHMENTS');
        const refArticleId = context?.getAdditionalInformation(ArticleProperty.REFERENCED_ARTICLE_ID);
        if (useRefArticleAttachments && refArticleId) {
            const refTicketId = context?.getObjectId();
            const refArticle = await this.loadReferencedArticle(Number(refTicketId), refArticleId);
            if (refArticle) {
                const attachments = await this.getRefAttachments(
                    refArticle.getAttachments(), refArticleId, Number(refTicketId)
                );
                if (attachments?.length) {
                    const newValue = attachments;
                    if (Array.isArray(this.value) && this.value.length) {
                        newValue.push(...this.value);
                    }
                    this.setFormValue(newValue, true);
                }
            }
        }
    }

    private async loadReferencedArticle(refTicketId: number, refArticleId: number): Promise<Article> {
        let article: Article;
        if (refArticleId && refTicketId) {
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, [refArticleId], new KIXObjectLoadingOptions(
                    null, null, null, [ArticleProperty.ATTACHMENTS]
                ),
                new ArticleLoadingOptions(refTicketId), true
            ).catch(() => [] as Article[]);
            article = articles.find((a) => a.ArticleID === refArticleId);
        }
        return article;
    }

    private async getRefAttachments(
        articleAttachments: Attachment[], refArticleId: number, refTicketId: number
    ): Promise<Attachment[]> {
        let attachmentsWithContent: Attachment[] = [];
        if (Array.isArray(articleAttachments) && articleAttachments.length) {
            const attachmentPromises = [];
            articleAttachments.forEach((a) => {
                if (!a.Content) {
                    const attachmentPromise = TicketService.getInstance().loadArticleAttachment(
                        Number(refTicketId), refArticleId, a.ID
                    );
                    if (attachmentPromise) {
                        attachmentPromises.push(attachmentPromise);
                    }
                } else {
                    attachmentPromises.push(a);
                }
            });
            attachmentsWithContent = await Promise.all(attachmentPromises);
        }
        return attachmentsWithContent;
    }
}