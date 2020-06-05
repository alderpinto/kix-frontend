/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { FAQArticleAttachmentLoadingOptions } from '../model/FAQArticleAttachmentLoadingOptions';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { CreateFAQVoteOptions } from '../model/CreateFAQVoteOptions';
import { Attachment } from '../../../model/kix/Attachment';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { FAQArticleProperty } from '../model/FAQArticleProperty';
import { FAQCategoryFactory } from './FAQCategoryFactory';
import { Error } from '../../../../../server/model/Error';
import { FilterCriteria } from '../../../model/FilterCriteria';


export class FAQService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = 'faq/articles';

    protected objectType: KIXObjectType | string = KIXObjectType.FAQ_ARTICLE;

    private static INSTANCE: FAQService;

    public static getInstance(): FAQService {
        if (!FAQService.INSTANCE) {
            FAQService.INSTANCE = new FAQService();
        }
        return FAQService.INSTANCE;
    }

    private constructor() {
        super([new FAQCategoryFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(type: KIXObjectType | string): boolean {
        return type === KIXObjectType.FAQ_ARTICLE
            || type === KIXObjectType.FAQ_ARTICLE_ATTACHMENT
            || type === KIXObjectType.FAQ_ARTICLE_HISTORY
            || type === KIXObjectType.FAQ_CATEGORY
            || type === KIXObjectType.FAQ_VOTE
            || type === KIXObjectType.FAQ_KEYWORD;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.FAQ_ARTICLE:
                objects = await super.load(
                    token, objectType, this.RESOURCE_URI, loadingOptions, objectIds, 'FAQArticle'
                );
                break;
            case KIXObjectType.FAQ_CATEGORY:
                const categoryUri = this.buildUri('system', 'faq', 'categories');
                objects = await super.load(token, objectType, categoryUri, loadingOptions, objectIds, 'FAQCategory');
                break;
            case KIXObjectType.FAQ_ARTICLE_ATTACHMENT:
                objects = await this.loadAttachment(
                    token, loadingOptions, (objectLoadingOptions as FAQArticleAttachmentLoadingOptions)
                );
                break;
            case KIXObjectType.FAQ_KEYWORD:
                const uri = this.buildUri(this.RESOURCE_URI, 'keywords');
                objects = await super.load<string>(token, KIXObjectType.FAQ_KEYWORD, uri, null, null, 'FAQKeyword');
                break;
            default:
        }

        return objects;
    }

    public createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        switch (objectType) {
            case KIXObjectType.FAQ_ARTICLE:
                return this.createFAQArticle(token, clientRequestId, parameter);
            case KIXObjectType.FAQ_VOTE:
                return this.createFAQVote(token, clientRequestId, parameter, (createOptions as CreateFAQVoteOptions));
            case KIXObjectType.FAQ_CATEGORY:
                return this.createFAQCategory(token, clientRequestId, parameter);
            default:
                const error = 'No create option for object type ' + objectType;
                throw error;
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string,
        parameter: Array<[string, any]>, objectId: number
    ): Promise<string | number> {
        switch (objectType) {
            case KIXObjectType.FAQ_ARTICLE:
                return this.updateFAQArticle(token, clientRequestId, parameter, objectId);
            case KIXObjectType.FAQ_CATEGORY:
                return this.updateFAQCategory(token, clientRequestId, parameter, objectId);
            default:
                const error = 'No update option for object type ' + objectType;
                throw error;
        }
    }

    private async updateAttachments(
        token: string, clientRequestId: string, objectId: number, attachments: Attachment[]
    ): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId, 'attachments');

        const existingAttachments = await super.load<Attachment>(
            token, KIXObjectType.FAQ_ARTICLE_ATTACHMENT, uri, null, null, 'Attachment'
        );

        const deletableAttachments = existingAttachments
            ? existingAttachments.filter((a) => a.Disposition !== 'inline' && !attachments.some((at) => at.ID === a.ID))
            : [];

        for (const attachment of deletableAttachments) {
            const attachmentUri = this.buildUri(this.RESOURCE_URI, objectId, 'attachments', attachment.ID);
            await this.sendDeleteRequest(token, clientRequestId, [attachmentUri], this.objectType);
        }

        const newAttachments = attachments ? attachments.filter((a) => !a.ID) : [];
        for (const attachment of newAttachments) {
            const parameter: Array<[string, any]> = [];
            for (const p in attachment) {
                if (attachment[p]) {
                    parameter.push([p, attachment[p]]);
                }
            }

            await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, uri, KIXObjectType.FAQ_ARTICLE_ATTACHMENT, 'AttachmentID', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }
    }

    private async createFAQArticle(
        token: string, clientRequestId: string, parameter: Array<[string, any]>
    ): Promise<number> {
        const createParameter = parameter.filter((p) => p[0] !== FAQArticleProperty.LINK);

        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, createParameter, this.RESOURCE_URI, this.objectType, 'FAQArticleID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        await this.createLinks(
            token, clientRequestId, id, this.getParameterValue(parameter, FAQArticleProperty.LINK)
        );

        return id;
    }

    private async updateFAQArticle(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, objectId: number
    ): Promise<number> {
        const updateParameter = parameter.filter(
            (p) => p[0] !== FAQArticleProperty.LINK && p[0] !== FAQArticleProperty.ATTACHMENTS
        );

        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, updateParameter, uri, this.objectType, 'FAQArticleID'
        );

        const attachments = parameter.find((p) => p[0] === FAQArticleProperty.ATTACHMENTS);
        await this.updateAttachments(
            token, clientRequestId, objectId, attachments && attachments.length ? attachments[1] : []
        );

        return id;
    }

    public async updateFAQCategory(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, objectId: number
    ): Promise<number> {
        const uri = this.buildUri('system', 'faq', 'categories', objectId);

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.FAQ_CATEGORY, 'FAQCategoryID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }


    private async createFAQVote(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, createOptions: CreateFAQVoteOptions
    ): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, createOptions.faqArticleId, 'votes');

        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.FAQ_VOTE, 'FAQVoteID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async createFAQCategory(
        token: string, clientRequestId: string, parameter: Array<[string, any]>
    ): Promise<number> {
        const uri = this.buildUri('system', 'faq', 'categories');

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.FAQ_CATEGORY, 'FAQCategoryID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async loadAttachment(
        token: string, loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: FAQArticleAttachmentLoadingOptions
    ): Promise<Attachment[]> {
        if (objectLoadingOptions) {
            const uri = this.buildUri(
                this.RESOURCE_URI, objectLoadingOptions.faqArticleId,
                'attachments', objectLoadingOptions.attachmentId
            );

            const attachments = await super.load<Attachment>(token, null, uri, loadingOptions, null, 'Attachment');
            return attachments;
        } else {
            const error = 'No FAQArticleAttachmentLoadingOptions given.';
            throw error;
        }
    }

    protected async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return criteria.filter(
            (f) => f.property !== FAQArticleProperty.CUSTOMER_VISIBLE
        );
    }


}
