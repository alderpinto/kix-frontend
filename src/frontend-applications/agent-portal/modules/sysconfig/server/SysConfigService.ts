/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { SysConfigOption } from '../model/SysConfigOption';
import { SysConfigOptionDefinition } from '../model/SysConfigOptionDefinition';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { Error } from '../../../../../server/model/Error';
import { ModuleConfigurationService } from '../../../server/services/configuration';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { KIXObjectSpecificDeleteOptions } from '../../../model/KIXObjectSpecificDeleteOptions';
import { SysConfigKey } from '../model/SysConfigKey';
import { FilterCriteria } from '../../../model/FilterCriteria';

export class SysConfigService extends KIXObjectAPIService {

    private static INSTANCE: SysConfigService;

    public static getInstance(): SysConfigService {
        if (!SysConfigService.INSTANCE) {
            SysConfigService.INSTANCE = new SysConfigService();
        }
        return SysConfigService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'config');

    public objectType: KIXObjectType | string = KIXObjectType.SYS_CONFIG_OPTION;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.SYS_CONFIG_OPTION
            || kixObjectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;
    }

    public async loadObjects<O>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects = [];

        if (objectType === KIXObjectType.SYS_CONFIG_OPTION) {
            objects = await super.load<SysConfigOption>(
                token, KIXObjectType.SYS_CONFIG_OPTION, this.RESOURCE_URI, loadingOptions, objectIds, 'SysConfigOption',
                SysConfigOption
            );
        } else if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, 'definitions');
            objects = await super.load<SysConfigOptionDefinition>(
                token, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, uri,
                loadingOptions, objectIds, 'SysConfigOptionDefinition', SysConfigOptionDefinition
            );
        }

        return objects;
    }
    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string,
        parameter: Array<[string, any]>, objectId: string
    ): Promise<string> {
        if (objectType === KIXObjectType.SYS_CONFIG_OPTION) {
            const uri = this.buildUri(this.RESOURCE_URI, objectId);
            const id = await super.executeUpdateOrCreateRequest<string>(
                token, clientRequestId, parameter, uri, this.objectType, 'Name'
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            ModuleConfigurationService.getInstance().sysconfigChanged(id);
            return id;
        } else if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, 'definitions', objectId);
            const id = await super.executeUpdateOrCreateRequest<string>(
                token, clientRequestId, parameter, uri, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, 'Option'
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            ModuleConfigurationService.getInstance().sysconfigChanged(id);
            return id;
        }
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, any]>,
        createOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, 'definitions');
            const id = await super.executeUpdateOrCreateRequest<string>(
                token, clientRequestId, parameter, uri, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION,
                'Option', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
            ModuleConfigurationService.getInstance().sysconfigChanged(id);
            return id;
        } else {
            return super.createObject(token, clientRequestId, objectType, parameter, createOptions, cacheKeyPrefix);
        }
    }

    public async deleteObjects(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<string | number>,
        deleteOptions?: KIXObjectSpecificDeleteOptions, logError: boolean = true
    ): Promise<void> {
        if (objectType === KIXObjectType.SYS_CONFIG_OPTION_DEFINITION) {
            const uris = objectIds.map((id) => this.buildUri(this.RESOURCE_URI, 'definitions', id));
            const errors: Error[] = await this.sendDeleteRequest(token, clientRequestId, uris, objectType, logError)
                .catch((error) => { throw new Error(error.Code, error.Message); });
            errors.forEach((e) => LoggingService.getInstance().error(`${e.Code}: ${e.Message}`, e));
        }
    }

    public async getTicketViewableStateTypes(token: string): Promise<string[]> {
        const viewableStateTypes = await this.loadObjects<SysConfigOption>(
            token, '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_VIEWABLE_STATE_TYPE], null, null
        ).catch(() => [] as SysConfigOption[]);

        const stateTypes: string[] = viewableStateTypes && viewableStateTypes.length ? viewableStateTypes[0].Value : [];

        return stateTypes && !!stateTypes.length ? stateTypes : ['new', 'open', 'pending reminder', 'pending auto'];
    }

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return [];
    }

}
