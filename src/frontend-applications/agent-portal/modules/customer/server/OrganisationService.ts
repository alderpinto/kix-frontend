/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { CreateOrganisation } from './api/CreateOrganisation';
import { CreateOrganisationResponse } from './api/CreateOrganisationResponse';
import { CreateOrganisationRequest } from './api/CreateOrganisationRequest';
import { UpdateOrganisation } from './api/UpdateOrganisation';
import { UpdateOrganisationResponse } from './api/UpdateOrganisationResponse';
import { UpdateOrganisationRequest } from './api/UpdateOrganisationRequest';
import { Error } from '../../../../../server/model/Error';
import { Organisation } from '../model/Organisation';
import { ObjectIcon } from '../../icon/model/ObjectIcon';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { OrganisationProperty } from '../model/OrganisationProperty';
import { SearchProperty } from '../../search/model/SearchProperty';

export class OrganisationAPIService extends KIXObjectAPIService {

    private static INSTANCE: OrganisationAPIService;

    protected enableSearchQuery: boolean = false;

    public static getInstance(): OrganisationAPIService {
        if (!OrganisationAPIService.INSTANCE) {
            OrganisationAPIService.INSTANCE = new OrganisationAPIService();
        }
        return OrganisationAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'organisations';

    public objectType: KIXObjectType = KIXObjectType.ORGANISATION;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.ORGANISATION;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        objectIds: string[], loadingOptions: KIXObjectLoadingOptions
    ): Promise<T[]> {

        let objects = [];

        if (objectType === KIXObjectType.ORGANISATION) {
            objects = await super.load(
                token, KIXObjectType.ORGANISATION, this.RESOURCE_URI, loadingOptions, objectIds,
                KIXObjectType.ORGANISATION, Organisation
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>
    ): Promise<string> {
        const createOrganisation = new CreateOrganisation(parameter);

        const response = await this.sendCreateRequest<CreateOrganisationResponse, CreateOrganisationRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateOrganisationRequest(createOrganisation),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon && icon.Content) {
            icon.Object = objectType;
            icon.ObjectID = response.OrganisationID;
            await this.createIcon(token, clientRequestId, icon)
                .catch(() => {
                    // be silent
                });
        }

        return response.OrganisationID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateOrganisation = new UpdateOrganisation(parameter);

        const response = await this.sendUpdateRequest<UpdateOrganisationResponse, UpdateOrganisationRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId),
            new UpdateOrganisationRequest(updateOrganisation), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon && icon.Content) {
            icon.Object = objectType;
            icon.ObjectID = response.OrganisationID;
            await this.updateIcon(token, clientRequestId, icon)
                .catch(() => {
                    // be silent
                });
        }

        return response.OrganisationID;
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return criteria.filter(
            (c) => c.property === OrganisationProperty.NAME
                || c.property === OrganisationProperty.NUMBER
                || c.property === SearchProperty.FULLTEXT
        );
    }

}
