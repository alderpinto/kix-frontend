import { injectable, inject } from 'inversify';
import Plugins = require('js-plugins');

import {
    IWidgetFactoryExtension, IModuleFactoryExtension, KIXExtensions, IQuickSearchExtension
} from '@kix/core/dist/extensions';
import { IPluginService, IConfigurationService, ILoggingService } from '@kix/core/dist/services';
import { IServerConfiguration } from '@kix/core/dist/common';
import { IQuickSearch } from '../../../core/dist/model/quick-search/IQuickSearch';

const host = {
    debug: true
};

@injectable()
export class PluginService implements IPluginService {

    public pluginManager: any;

    public constructor(
        @inject("ILoggingService") protected loggingService: ILoggingService,
        @inject("IConfigurationService") configurationService: IConfigurationService) {
        const serverConfiguration: IServerConfiguration = configurationService.getServerConfiguration();
        this.pluginManager = new Plugins();

        const pluginDirs = [];
        const fs = require('fs');
        for (const dir of serverConfiguration.PLUGIN_FOLDERS) {
            const path = __dirname + '/../../' + dir;
            pluginDirs.push(path);
        }

        this.pluginManager.scanSubdirs(pluginDirs);
        this.pluginManager.scan();
    }

    public async getExtensions<T>(extensionId: string): Promise<T[]> {
        return await new Promise<T[]>((resolve, reject) => {
            const config = { multi: true };
            this.pluginManager.connect(host, extensionId, config,
                (error, extensions: T[], names) => {
                    if (error) {
                        this.loggingService.error('Error during http GET request.', error);
                        reject(error);
                    }
                    resolve(extensions);
                });
        });
    }

    public async getWidgetFactory(widgetId: string): Promise<IWidgetFactoryExtension> {
        const widgetFactories = await this.getExtensions<IWidgetFactoryExtension>(KIXExtensions.WIDGET);
        return widgetFactories.find((wf) => wf.widgetId === widgetId);
    }

    public async getWidgetFactories(): Promise<IWidgetFactoryExtension[]> {
        return await this.getExtensions<IWidgetFactoryExtension>(KIXExtensions.WIDGET);
    }

    public async getModuleFactory(moduleId: string): Promise<IModuleFactoryExtension> {
        const moduleFactories = await this.getExtensions<IModuleFactoryExtension>(KIXExtensions.MODUL);
        return moduleFactories.find((mf) => mf.getModuleId() === moduleId);
    }

    public async getQuickSearchExtension<T>(quickSearchId: string): Promise<IQuickSearchExtension<T>> {
        const quickSearches = await this.getExtensions<IQuickSearchExtension<any>>(KIXExtensions.QUICK_SEARCH);
        return quickSearches.find((qs) => qs.id === quickSearchId);
    }

    public async getQuickSearches(): Promise<IQuickSearch[]> {
        const extensions = await this.getExtensions<IQuickSearchExtension<any>>(KIXExtensions.QUICK_SEARCH);
        const quickSearches = extensions.map((e) => e.getQuickSearch());
        return quickSearches;
    }
}
