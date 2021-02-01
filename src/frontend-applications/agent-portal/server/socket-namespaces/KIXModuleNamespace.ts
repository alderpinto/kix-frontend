/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable: max-line-length
import { SocketNameSpace } from './SocketNameSpace';
import { KIXModulesEvent } from '../../modules/base-components/webapp/core/KIXModulesEvent';
import { LoadKIXModulesRequest } from '../../modules/base-components/webapp/core/LoadKIXModulesRequest';
import { SocketResponse } from '../../modules/base-components/webapp/core/SocketResponse';
import { PluginService } from '../../../../server/services/PluginService';
import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { LoadKIXModulesResponse } from '../../modules/base-components/webapp/core/LoadKIXModulesResponse';
import { SocketEvent } from '../../modules/base-components/webapp/core/SocketEvent';
import { SocketErrorResponse } from '../../modules/base-components/webapp/core/SocketErrorResponse';
import { LoadFormConfigurationsRequest } from '../../modules/base-components/webapp/core/LoadFormConfigurationsRequest';
import { ModuleConfigurationService } from '../services/configuration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormConfigurationResolver } from '../services/configuration/FormConfigurationResolver';
import { LoggingService } from '../../../../server/services/LoggingService';
import { LoadFormConfigurationsResponse } from '../../modules/base-components/webapp/core/LoadFormConfigurationsResponse';
import { ISocketRequest } from '../../modules/base-components/webapp/core/ISocketRequest';
import { LoadReleaseInfoResponse } from '../../modules/base-components/webapp/core/LoadReleaseInfoResponse';
import { Socket } from 'socket.io';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { ReleaseInfoUtil } from '../../../../server/ReleaseInfoUtil';
import { LoadFormConfigurationRequest } from '../../modules/base-components/webapp/core/LoadFormConfigurationRequest';
import { LoadFormConfigurationResponse } from '../../modules/base-components/webapp/core/LoadFormConfigurationResponse';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { SysConfigOptionProperty } from '../../modules/sysconfig/model/SysConfigOptionProperty';
import { SearchOperator } from '../../modules/search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { SysConfigService } from '../../modules/sysconfig/server/SysConfigService';
import { SysConfigOption } from '../../modules/sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { CacheService } from '../services/cache';
import { ISocketResponse } from '../../modules/base-components/webapp/core/ISocketResponse';
// tslint:enable

import cookie = require('cookie');

export class KIXModuleNamespace extends SocketNameSpace {

    private static INSTANCE: KIXModuleNamespace;

    public static getInstance(): KIXModuleNamespace {
        if (!KIXModuleNamespace.INSTANCE) {
            KIXModuleNamespace.INSTANCE = new KIXModuleNamespace();
        }
        return KIXModuleNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    private rebuildPromise: Promise<void>;

    protected getNamespace(): string {
        return 'kixmodules';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, KIXModulesEvent.LOAD_MODULES, this.loadModules.bind(this));

        this.registerEventHandler(client, KIXModulesEvent.LOAD_FORM_CONFIGURATIONS,
            this.loadFormConfigurations.bind(this));

        this.registerEventHandler(client, KIXModulesEvent.LOAD_FORM_CONFIGURATION,
            this.loadFormConfiguration.bind(this));

        this.registerEventHandler(client, KIXModulesEvent.LOAD_RELEASE_INFO,
            this.loadReleaseInfo.bind(this));

        this.registerEventHandler(client, KIXModulesEvent.REBUILD_FORM_CONFIG,
            this.rebuildConfiguration.bind(this));
    }

    protected initialize(): Promise<void> {
        CacheService.getInstance().adddIgnorePrefixes(['FormConfiguration']);
        return this.rebuildConfigCache();
    }

    private async rebuildConfiguration(
        data: ISocketRequest
    ): Promise<SocketResponse<ISocketResponse | SocketErrorResponse>> {
        await this.rebuildConfigCache().catch((error) => {
            LoggingService.getInstance().error('Error on rebuild form configurations', error);
        });

        const response: ISocketResponse = { requestId: data.requestId };
        return new SocketResponse(KIXModulesEvent.REBUILD_FORM_CONFIG_FINISHED, response);
    }

    public async rebuildConfigCache(): Promise<void> {
        if (!this.rebuildPromise) {
            this.rebuildPromise = new Promise<void>(async (resolve, reject) => {
                await CacheService.getInstance().deleteKeys('FormConfiguration', true);

                const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

                const loadingOptions = new KIXObjectLoadingOptions([
                    new FilterCriteria(
                        SysConfigOptionProperty.CONTEXT, SearchOperator.EQUALS, FilterDataType.STRING,
                        FilterType.AND, 'kix18-web-frontend'
                    )
                ]);

                const options = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                    serverConfig.BACKEND_API_TOKEN, 'FormConfiguration', KIXObjectType.SYS_CONFIG_OPTION, null,
                    loadingOptions, null
                ).catch((): SysConfigOption[] => []);

                const formOptions = options.filter((c) => c.ContextMetadata === 'Form');

                LoggingService.getInstance().info(`Build ${formOptions.length} form configurations.`);

                for (const formOption of formOptions) {

                    if (formOption.Value) {
                        const newConfig = await FormConfigurationResolver.resolve(
                            serverConfig.BACKEND_API_TOKEN, JSON.parse(formOption.Value), options
                        ).catch((error): FormConfiguration => {
                            LoggingService.getInstance().error(error);
                            LoggingService.getInstance().warning(
                                'Could not resolve form configuration ' + formOption.Name
                            );
                            return null;
                        });

                        await CacheService.getInstance().set(formOption.Name, newConfig, 'FormConfiguration');
                    }
                }

                this.rebuildPromise = null;
                resolve();
            });
        }
        return this.rebuildPromise;
    }

    private async loadModules(data: LoadKIXModulesRequest, client: SocketIO.Socket): Promise<SocketResponse> {
        let kixModulesResponse = await CacheService.getInstance().get('KIX_MODULES');
        if (!kixModulesResponse) {
            kixModulesResponse = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(
                AgentPortalExtensions.MODULES
            ).then(async (modules) => {
                const uiModules = modules.map((m) => {
                    return {
                        id: m.id,
                        external: m.external,
                        initComponents: m.initComponents,
                        uiComponents: m.uiComponents,
                        webDependencies: m.webDependencies,
                        applications: m.applications
                    };
                });

                const socketResponse = new SocketResponse(
                    KIXModulesEvent.LOAD_MODULES_FINISHED,
                    new LoadKIXModulesResponse(data.requestId, uiModules)
                );
                CacheService.getInstance().set('KIX_MODULES_RESPONSE', socketResponse);
                return socketResponse;
            }).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        }
        return kixModulesResponse;
    }

    private async loadFormConfigurations(
        data: LoadFormConfigurationsRequest
    ): Promise<SocketResponse> {
        const formIdsWithContext = ModuleConfigurationService.getInstance().getFormIDsWithContext();
        return new SocketResponse(
            KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_FINISHED,
            new LoadFormConfigurationsResponse(data.requestId, formIdsWithContext)
        );

    }

    private async loadFormConfiguration(
        data: LoadFormConfigurationRequest
    ): Promise<SocketResponse> {
        let form = await CacheService.getInstance().get(data.formId, 'FormConfiguration');

        if (!form) {
            await this.rebuildConfigCache();
            form = await CacheService.getInstance().get(data.formId, 'FormConfiguration');
        }

        return new SocketResponse(
            KIXModulesEvent.LOAD_FORM_CONFIGURATION_FINISHED,
            new LoadFormConfigurationResponse(data.requestId, form)
        );

    }

    private async loadReleaseInfo(data: ISocketRequest): Promise<SocketResponse<LoadReleaseInfoResponse>> {
        const releaseInfo = await ReleaseInfoUtil.getInstance().getReleaseInfo();
        return new SocketResponse(
            KIXModulesEvent.LOAD_RELEASE_INFO_FINISHED, new LoadReleaseInfoResponse(data.requestId, releaseInfo)
        );
    }

}
