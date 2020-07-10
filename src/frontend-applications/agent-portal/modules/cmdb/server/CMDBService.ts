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
import { GeneralCatalogItem } from '../../general-catalog/model/GeneralCatalogItem';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { SearchOperator } from '../../search/model/SearchOperator';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { ConfigItemProperty } from '../model/ConfigItemProperty';
import { ConfigItemVersionLoadingOptions } from '../model/ConfigItemVersionLoadingOptions';
import { ImagesLoadingOptions } from '../model/ImagesLoadingOptions';
import { ConfigItem } from '../model/ConfigItem';
import { ConfigItemResponse } from './api/ConfigItemResponse';
import { ConfigItemsResponse } from './api/ConfigItemsResponse';
import { ConfigItemImage } from '../model/ConfigItemImage';
import { ConfigItemImageResponse } from './api/ConfigItemImageResponse';
import { ConfigItemImagesResponse } from './api/ConfigItemImagesResponse';
import { ConfigItemAttachment } from '../model/ConfigItemAttachment';
import { ConfigItemAttachmentResponse } from './api/ConfigItemAttachmentResponse';
import { ConfigItemAttachmentsResponse } from './api/ConfigItemAttachmentsResponse';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { CreateConfigItemVersionOptions } from '../model/CreateConfigItemVersionOptions';
import { CreateConfigItemVersion } from './api/CreateConfigItemVersion';
import { CreateConfigItemVersionResponse } from './api/CreateConfigItemVersionResponse';
import { CreateConfigItemVersionRequest } from './api/CreateConfigItemVersionRequest';
import { CreateConfigItem } from './api/CreateConfigItem';
import { CreateConfigItemResponse } from './api/CreateConfigItemResponse';
import { CreateConfigItemRequest } from './api/CreateConfigItemRequest';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { Error } from '../../../../../server/model/Error';
import { AttachmentLoadingOptions } from '../model/AttachmentLoadingOptions';
import { Version } from '../model/Version';


export class CMDBAPIService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = 'cmdb';

    protected objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    private static INSTANCE: CMDBAPIService;

    public static getInstance(): CMDBAPIService {
        if (!CMDBAPIService.INSTANCE) {
            CMDBAPIService.INSTANCE = new CMDBAPIService();
        }
        return CMDBAPIService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONFIG_ITEM
            || kixObjectType === KIXObjectType.CONFIG_ITEM_VERSION
            || kixObjectType === KIXObjectType.CONFIG_ITEM_IMAGE
            || kixObjectType === KIXObjectType.CONFIG_ITEM_ATTACHMENT;
    }

    public async getDeploymentStates(token: string): Promise<GeneralCatalogItem[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria('Class', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'ITSM::ConfigItem::DeploymentState'),
            new FilterCriteria('Functionality', SearchOperator.NOT_EQUALS, FilterDataType.STRING,
                FilterType.AND, 'postproductive')
        ]);

        const catalogItems = await this.loadObjects<GeneralCatalogItem>(
            token, null, KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions, null
        );

        return catalogItems;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.CONFIG_ITEM:
                objects = await this.getConfigItems(token, objectIds, loadingOptions);
                break;
            case KIXObjectType.CONFIG_ITEM_VERSION:
                if (objectLoadingOptions) {
                    const uri = this.buildUri(
                        this.RESOURCE_URI,
                        'configitems',
                        (objectLoadingOptions as ConfigItemVersionLoadingOptions).configItemId,
                        'versions'
                    );
                    objects = await super.load(
                        token, KIXObjectType.CONFIG_ITEM_VERSION, uri, loadingOptions, objectIds, 'ConfigItemVersion',
                        Version
                    );
                }
                break;
            case KIXObjectType.CONFIG_ITEM_IMAGE:
                objects = await this.getImages(
                    token, objectIds, loadingOptions,
                    objectLoadingOptions as ImagesLoadingOptions
                );
                break;
            case KIXObjectType.CONFIG_ITEM_ATTACHMENT:
                objects = await this.getAttachments(
                    token, objectIds, loadingOptions,
                    objectLoadingOptions as AttachmentLoadingOptions
                );
                break;
            default:
        }
        return objects;
    }

    private async getConfigItems(
        token: string, configItemIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<ConfigItem[]> {
        loadingOptions = loadingOptions || new KIXObjectLoadingOptions();

        const query = this.prepareQuery(loadingOptions);

        let configItems: ConfigItem[] = [];

        if (configItemIds) {
            if (!!configItemIds.length) {
                configItemIds = configItemIds.filter(
                    (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
                );

                const uri = this.buildUri('cmdb', 'configitems', configItemIds.join(','));
                const response = await this.getObjectByUri<ConfigItemResponse | ConfigItemsResponse>(
                    token, uri, query
                );

                if (configItemIds.length === 1) {
                    configItems = [(response as ConfigItemResponse).ConfigItem];
                } else {
                    configItems = (response as ConfigItemsResponse).ConfigItem;
                }
            }

        } else if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'ConfigItem', query);
            const uri = this.buildUri('cmdb', 'configitems');
            const response = await this.getObjectByUri<ConfigItemsResponse>(token, uri, query);
            configItems = response.ConfigItem;
        } else {
            const uri = this.buildUri('cmdb', 'configitems');
            const response = await this.getObjectByUri<ConfigItemsResponse>(token, uri, query);
            configItems = response.ConfigItem;
        }

        return configItems.map((ci) => new ConfigItem(ci));
    }

    private async getImages(
        token: string, imageIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: ImagesLoadingOptions
    ): Promise<ConfigItemImage[]> {
        if (objectLoadingOptions.configItemId) {
            const subResource = 'configitems/' + objectLoadingOptions.configItemId + '/images';

            loadingOptions = loadingOptions || new KIXObjectLoadingOptions();
            if (
                loadingOptions.includes
                && !!loadingOptions.includes.length
                && !loadingOptions.includes.some((i) => i === 'Content')
            ) {
                loadingOptions.includes = [...loadingOptions.includes, 'Content'];
            } else {
                loadingOptions.includes = ['Content'];
            }
            const query = this.prepareQuery(loadingOptions);

            let images: ConfigItemImage[] = [];

            if (imageIds && imageIds.length) {
                imageIds = imageIds.filter(
                    (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
                );

                const uri = this.buildUri('cmdb', subResource, imageIds.join(','));
                const response = await this.getObjectByUri<ConfigItemImageResponse | ConfigItemImagesResponse>(
                    token, uri, query
                );

                if (imageIds.length === 1) {
                    images = [(response as ConfigItemImageResponse).Image];
                } else {
                    images = (response as ConfigItemImagesResponse).Image;
                }

            } else if (loadingOptions.filter) {
                await this.buildFilter(loadingOptions.filter, 'Image', query);
                const uri = this.buildUri('cmdb', subResource);
                const response = await this.getObjectByUri<ConfigItemImagesResponse>(token, uri, query);
                images = response.Image;
            } else {
                const uri = this.buildUri('cmdb', subResource);
                const response = await this.getObjectByUri<ConfigItemImagesResponse>(token, uri, query);
                images = response.Image;
            }

            return images.map((cii) => new ConfigItemImage(cii));
        } else {
            throw new Error('', 'No config item id given!');
        }
    }

    private async getAttachments(
        token: string, attachmentIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions,
        objectLoadingOptions: AttachmentLoadingOptions
    ): Promise<ConfigItemAttachment[]> {

        let attachments: ConfigItemAttachment[] = [];

        if (
            attachmentIds && attachmentIds.length &&
            objectLoadingOptions.configItemId && objectLoadingOptions.versionId
        ) {
            const subResource = this.buildUri(
                'configitems', objectLoadingOptions.configItemId,
                'versions', objectLoadingOptions.versionId,
                'attachments'
            );

            loadingOptions = loadingOptions || new KIXObjectLoadingOptions();

            const query = this.prepareQuery(loadingOptions);
            attachmentIds = attachmentIds.filter(
                (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
            );

            const uri = this.buildUri('cmdb', subResource, attachmentIds.join(','));
            const response = await this.getObjectByUri<ConfigItemAttachmentResponse | ConfigItemAttachmentsResponse>(
                token, uri, query
            );

            if (attachmentIds.length === 1) {
                attachments = [(response as ConfigItemAttachmentResponse).Attachment];
            } else {
                attachments = (response as ConfigItemAttachmentsResponse).Attachment;
            }
        }

        return attachments.map((a) => new ConfigItemAttachment(a));
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        if (objectType === KIXObjectType.CONFIG_ITEM_VERSION) {
            const options = createOptions as CreateConfigItemVersionOptions;
            const createConfigItemVersion = new CreateConfigItemVersion(parameter);
            const uri = this.buildUri('cmdb', 'configitems', options.configItemId, 'versions');
            const response
                = await this.sendCreateRequest<CreateConfigItemVersionResponse, CreateConfigItemVersionRequest>(
                    token, clientRequestId, uri, new CreateConfigItemVersionRequest(createConfigItemVersion),
                    this.objectType
                );
            return response.VersionID;
        } else {
            const createConfigItem = new CreateConfigItem(parameter.filter((p) => p[0] !== ConfigItemProperty.LINKS));
            const uri = this.buildUri('cmdb', 'configitems');
            const response = await this.sendCreateRequest<CreateConfigItemResponse, CreateConfigItemRequest>(
                token, clientRequestId, uri, new CreateConfigItemRequest(createConfigItem), this.objectType
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            const configItemId = response.ConfigItemID;

            const links = this.getParameterValue(parameter, ConfigItemProperty.LINKS);
            if (links && links.length) {
                await this.createLinks(token, clientRequestId, Number(configItemId), links);
            }

            return configItemId;
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', 'Method not implemented.');
    }

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return criteria.filter((c) =>
            c.property !== ConfigItemProperty.CONFIG_ITEM_ID &&
            c.property !== ConfigItemProperty.NUMBER &&
            c.property !== ConfigItemProperty.NAME &&
            c.property !== 'InciStateIDs' &&
            c.property !== 'DeplStateIDs' &&
            c.property !== 'ClassIDs'
        );
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const newCriteria = criteria.filter((c) =>
            !c.property.startsWith('Data') &&
            !c.property.startsWith('CurrentVersion')
        );

        for (const searchCriteria of newCriteria) {
            switch (searchCriteria.property) {
                case ConfigItemProperty.CLASS_ID:
                    searchCriteria.property = 'ClassIDs';
                    searchCriteria.operator = SearchOperator.IN;
                    searchCriteria.value = Array.isArray(searchCriteria.value)
                        ? searchCriteria.value : [searchCriteria.value as number];
                    break;
                case ConfigItemProperty.CUR_DEPL_STATE_ID:
                    searchCriteria.property = 'DeplStateIDs';
                    searchCriteria.operator = SearchOperator.IN;
                    searchCriteria.value = Array.isArray(searchCriteria.value)
                        ? searchCriteria.value : [searchCriteria.value as number];
                    break;
                case ConfigItemProperty.CUR_INCI_STATE_ID:
                    searchCriteria.property = 'InciStateIDs';
                    searchCriteria.operator = SearchOperator.IN;
                    searchCriteria.value = Array.isArray(searchCriteria.value)
                        ? searchCriteria.value : [searchCriteria.value as number];
                    break;
                default:
            }
        }
        return newCriteria;
    }
}
