/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXExtensions, IKIXModuleExtension } from '../core/extensions';
import jsonfile = require('jsonfile');
import { PluginService } from './PluginService';
import { ProfilingService, LoggingService } from '../core/services';

export class MarkoService {

    private static INSTANCE: MarkoService;

    public static getInstance(): MarkoService {
        if (!MarkoService.INSTANCE) {
            MarkoService.INSTANCE = new MarkoService();
        }
        return MarkoService.INSTANCE;
    }

    private browserJsonPath: string = '../components/_app/browser.json';

    private ready: boolean = false;

    private constructor() { }

    public async registerMarkoDependencies(): Promise<void> {
        const modules: IKIXModuleExtension[] = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(
            KIXExtensions.MODULES
        );

        const browserJSON = require(this.browserJsonPath);

        this.fillDependencies(browserJSON, modules);
        await this.saveBrowserJSON(browserJSON);
        await this.buildMarkoApp();
    }

    private fillDependencies(browserJSON: any, modules: IKIXModuleExtension[]): void {
        for (const kixModule of modules) {
            let prePath = 'require ../';
            if (kixModule.external) {
                prePath = 'require: ../../../node_modules/';
            }

            const components = [...kixModule.uiComponents];
            for (const uiComponent of components) {
                const dependency = prePath + uiComponent.componentPath;
                const exists = browserJSON.dependencies.find((d) => d === dependency);
                if (!exists) {
                    browserJSON.dependencies.push(dependency);
                }
            }
        }
    }

    private async saveBrowserJSON(browserJSON: any): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            jsonfile.writeFile(__dirname + "/" + this.browserJsonPath, browserJSON,
                (fileError: Error) => {
                    if (fileError) {
                        LoggingService.getInstance().error(fileError.message);
                        reject(fileError);
                    }

                    resolve();
                });
        });
    }

    private async buildMarkoApp(): Promise<void> {
        const profileTaskId = ProfilingService.getInstance().start(
            'MarkoService', 'Build App'
        );

        this.appIsReady();

        const loginTemplate = require('../components/_login-app');
        await new Promise<void>((resolve, reject) => {
            loginTemplate.render(
                {
                    themeCSS: [],
                    specificCSS: []
                }, (error, result) => {
                    if (error) {
                        ProfilingService.getInstance().stop(profileTaskId, 'Login build error.');
                        LoggingService.getInstance().error(error);
                        reject(error);
                    } else {
                        LoggingService.getInstance().info("Login app build finished.");
                        resolve();
                    }
                });
        });

        const appTemplate = require('../components/_app');
        await new Promise<void>((resolve, reject) => {
            appTemplate.render(
                {
                    themeCSS: [],
                    specificCSS: []
                }, (error, result) => {
                    if (error) {
                        ProfilingService.getInstance().stop(profileTaskId, 'App build error.');
                        LoggingService.getInstance().error(error);
                        reject(error);
                    } else {
                        ProfilingService.getInstance().stop(profileTaskId, 'App build finished.');
                        this.ready = true;
                        resolve();
                    }
                });
        });
    }

    public async appIsReady(): Promise<boolean> {
        let tryCount = 20;
        while (!this.ready && tryCount > 0) {
            await this.waitForReadyState();
            tryCount -= 1;
        }

        return this.ready;
    }

    private async waitForReadyState(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                LoggingService.getInstance().info('App build in progress');
                resolve();
            }, 6000);
        });
    }

}
