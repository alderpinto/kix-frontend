/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { SystemAddressFactory } from "./SystemAddressFactory";
import { KIXObjectServiceRegistry } from "../../../server/services/KIXObjectServiceRegistry";
import { KIXObjectLoadingOptions } from "../../../model/KIXObjectLoadingOptions";
import { KIXObjectSpecificLoadingOptions } from "../../../model/KIXObjectSpecificLoadingOptions";
import { SystemAddress } from "../model/SystemAddress";
import { KIXObjectSpecificCreateOptions } from "../../../model/KIXObjectSpecificCreateOptions";
import { LoggingService } from "../../../../../server/services/LoggingService";
import { KIXObjectAPIService } from "../../../server/services/KIXObjectAPIService";
import { Error } from "../../../../../server/model/Error";

export class SystemAddressService extends KIXObjectAPIService {

    private static INSTANCE: SystemAddressService;

    public static getInstance(): SystemAddressService {
        if (!SystemAddressService.INSTANCE) {
            SystemAddressService.INSTANCE = new SystemAddressService();
        }
        return SystemAddressService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'communication', 'systemaddresses');

    public objectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS;

    private constructor() {
        super([new SystemAddressFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SYSTEM_ADDRESS;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.SYSTEM_ADDRESS) {
            objects = await super.load<SystemAddress>(
                token, KIXObjectType.SYSTEM_ADDRESS, this.RESOURCE_URI, loadingOptions, objectIds, 'SystemAddress'
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, this.RESOURCE_URI, KIXObjectType.SYSTEM_ADDRESS, 'SystemAddressID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);

        const id = super.executeUpdateOrCreateRequest(
            token, clientRequestId, parameter, uri, KIXObjectType.SYSTEM_ADDRESS, 'SystemAddressID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }
}
