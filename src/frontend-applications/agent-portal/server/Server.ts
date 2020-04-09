/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import * as bodyParser from 'body-parser';
import * as path from 'path';

import nodeRequire = require('marko/node-require');
nodeRequire.install(); // Allow Node.js to require and load `.marko` files

import markoExpress = require('marko/express');
import compression = require('compression');

import lassoMiddleware = require('lasso/middleware');

import express = require('express');
import cookieParser = require('cookie-parser');
import fs = require('fs');
import http = require('http');
import https = require('https');
import forceSSl = require('express-force-ssl');
import { LoggingService } from '../../../server/services/LoggingService';
import { IServerConfiguration } from '../../../server/model/IServerConfiguration';
import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { CreateClientRegistration } from './model/CreateClientRegistration';
import { MarkoService } from './services/MarkoService';
import { ServerRouter } from './routes/ServerRouter';
import { AuthenticationService } from './services/AuthenticationService';
import { PluginService } from '../../../server/services/PluginService';
import { AgentPortalExtensions } from './extensions/AgentPortalExtensions';
import { IConfigurationExtension } from './extensions/IConfigurationExtension';
import { IConfiguration } from '../model/configuration/IConfiguration';
import { Error } from '../../../server/model/Error';
import { SysConfigOptionDefinition } from '../modules/sysconfig/model/SysConfigOptionDefinition';
import { ClientRegistrationService } from './services/ClientRegistrationService';
import { IServer } from '../../../server/model/IServer';
import { SocketService } from './services/SocketService';
import { IServiceExtension } from './extensions/IServiceExtension';
import { TranslationAPIService } from '../modules/translation/server/TranslationService';
import { SysConfigAccessLevel } from '../modules/sysconfig/model/SysConfigAccessLevel';
import { ReleaseInfoUtil } from '../../../server/ReleaseInfoUtil';
import { SystemInfo } from '../model/SystemInfo';
import { SysConfigKey } from '../modules/sysconfig/model/SysConfigKey';
import { IInitialDataExtension } from '../model/IInitialDataExtension';
import { IFormConfigurationExtension } from './extensions/IFormConfigurationExtension';
import { FormGroupConfiguration } from '../model/configuration/FormGroupConfiguration';

export class Server implements IServer {

    private static INSTANCE: Server;

    public static getInstance(): Server {
        if (!Server.INSTANCE) {
            Server.INSTANCE = new Server();
        }
        return Server.INSTANCE;
    }

    public application: express.Application;
    private serverConfig: IServerConfiguration;

    public async initServer(): Promise<void> {
        const configDir = path.join(__dirname, '..', '..', '..', '..', 'config');
        const certDir = path.join(__dirname, '..', '..', '..', '..', 'cert');
        ConfigurationService.getInstance().init(configDir, certDir);

        const serviceExtensions = await PluginService.getInstance().getExtensions<IServiceExtension>(
            AgentPortalExtensions.SERVICES
        );

        LoggingService.getInstance().info(`Initialize ${serviceExtensions.length} service extensions`);
        for (const extension of serviceExtensions) {
            await extension.initServices();
        }

        const initialDataExtensions = await PluginService.getInstance().getExtensions<IInitialDataExtension>(
            AgentPortalExtensions.INITIAL_DATA
        );
        LoggingService.getInstance().info(`Create initial data (${initialDataExtensions.length} extensions)`);
        for (const extension of initialDataExtensions) {
            await extension.createData();
        }

        this.serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        await this.initializeApplication();
    }

    private async initializeApplication(): Promise<void> {
        await MarkoService.getInstance().initializeMarkoApplications();

        this.application = express();

        this.application.use(compression());
        this.application.use(bodyParser.json({ limit: '50mb', extended: true }));
        this.application.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        this.application.use(cookieParser());

        const httpsPort = this.serverConfig.HTTPS_PORT || 3001;

        if (this.serverConfig.USE_SSL) {
            this.application.set('forceSSLOptions', {
                httpsPort,
                sslRequiredMessage: 'SSL Required.'
            });
            this.application.use(forceSSl);
        }

        await this.registerStaticContent();

        const router = new ServerRouter(this.application);
        await router.initializeRoutes();

        this.initHttpServer();
    }

    public async initHttpServer(): Promise<void> {
        const httpPort = this.serverConfig.HTTP_PORT || 3000;
        const httpServer = http.createServer(this.application).listen(httpPort, () => {
            LoggingService.getInstance().info("KIX (HTTP) running on *:" + httpPort);
        });

        if (this.serverConfig.USE_SSL) {
            const options = {
                key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
                cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
                passphrase: 'kix2018'
            };

            const httpsServer = https.createServer(options, this.application);

            const httpsPort = this.serverConfig.HTTPS_PORT || 3001;

            await SocketService.getInstance().initialize(httpsServer);

            httpsServer.listen(httpsPort, () => {
                LoggingService.getInstance().info("KIX (HTTPS) running on *:" + httpsPort);
            });
        } else {
            await SocketService.getInstance().initialize(httpServer);
        }
    }

    private async registerStaticContent(): Promise<void> {
        this.application.use(markoExpress());
        this.application.use(lassoMiddleware.serveStatic());

        this.application.use(express.static('../static/'));
    }

    public static async createClientRegistration(): Promise<void> {
        LoggingService.getInstance().info('Create Clientregsitration');
        let poDefinitions = [];

        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const updateTranslations = serverConfig.UPDATE_TRANSLATIONS;
        if (updateTranslations) {
            LoggingService.getInstance().info('Update translations');
            poDefinitions = await TranslationAPIService.getInstance().getPODefinitions();
        }

        const configurations = await this.createDefaultConfigurations();

        const backendDependencies = this.getBackendDependencies();
        const plugins = this.getPlugins();

        const createClientRegistration = new CreateClientRegistration(
            serverConfig.NOTIFICATION_CLIENT_ID,
            serverConfig.NOTIFICATION_URL,
            serverConfig.NOTIFICATION_INTERVAL,
            'Token ' + AuthenticationService.getInstance().getCallbackToken(),
            poDefinitions, configurations, backendDependencies, plugins
        );

        const systemInfo = await ClientRegistrationService.getInstance().createClientRegistration(
            serverConfig.BACKEND_API_TOKEN, null, createClientRegistration
        ).catch((error): SystemInfo => {
            LoggingService.getInstance().error(error);
            return null;
        });

        ReleaseInfoUtil.getInstance().setSysteminfo(systemInfo);
        LoggingService.getInstance().info('Clientregsitration finished.');
    }

    private static async createDefaultConfigurations(): Promise<SysConfigOptionDefinition[]> {
        LoggingService.getInstance().info('Create Default Configurations');
        const extensions = await PluginService.getInstance().getExtensions<IConfigurationExtension>(
            AgentPortalExtensions.CONFIGURATION
        ).catch((): IConfigurationExtension[] => []);

        if (extensions) {
            LoggingService.getInstance().info(`Found ${extensions.length} configuration extensions`);

            let configurations: IConfiguration[] = [];
            for (const extension of extensions) {
                let formConfigurations = await extension.getFormConfigurations().catch(
                    (error: Error): IConfiguration[] => {
                        LoggingService.getInstance().error(error.Message);
                        return [];
                    }
                );
                let defaultConfigurations = await extension.getDefaultConfiguration().catch(
                    (error: Error): IConfiguration[] => {
                        LoggingService.getInstance().error(error.Message);
                        return [];
                    }
                );

                formConfigurations = formConfigurations || [];

                defaultConfigurations = defaultConfigurations || [];

                configurations = [
                    ...configurations,
                    ...formConfigurations,
                    ...defaultConfigurations
                ];
            }

            await this.extendFormConfigurations(configurations);

            const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

            const sysconfigOptionDefinitions = configurations.map((c) => {
                const name = c.name ? c.name : c.id;
                const definition: any = {
                    AccessLevel: SysConfigAccessLevel.INTERNAL,
                    Name: c.id,
                    Description: name,
                    Default: JSON.stringify(c),
                    Context: serverConfig.NOTIFICATION_CLIENT_ID,
                    ContextMetadata: c.type,
                    Type: 'String',
                    IsRequired: 0
                };
                return definition;
            });

            const browserTimeoutConfig: any = {
                AccessLevel: SysConfigAccessLevel.INTERNAL,
                Name: SysConfigKey.BROWSER_SOCKET_TIMEOUT_CONFIG,
                Description: 'Timeout (in ms) configuration for socket requests.',
                Default: '30000',
                Context: serverConfig.NOTIFICATION_CLIENT_ID,
                ContextMetadata: 'agent-portal-configuration',
                Type: 'String',
                IsRequired: 0
            };
            sysconfigOptionDefinitions.push(browserTimeoutConfig);

            return sysconfigOptionDefinitions;
        }
    }

    private static getBackendDependencies(): any[] {
        let dependencies = [];
        const plugins = PluginService.getInstance().availablePlugins;
        for (const plugin of plugins) {
            dependencies = [
                ...dependencies,
                ...plugin[1].dependencies
                    .filter((d) => d[0].startsWith('backend::'))
                    .map((d) => {
                        return {
                            Product: d[0].replace('backend::', ''),
                            Operator: d[1],
                            BuildNumber: Number(d[2])
                        };
                    })
            ];
        }
        return dependencies;
    }

    private static async extendFormConfigurations(formConfigurations: IConfiguration[]): Promise<void> {
        if (formConfigurations.length) {
            const extensions = await PluginService.getInstance().getExtensions<IFormConfigurationExtension>(
                AgentPortalExtensions.EXTENDED_FORM_CONFIGURATION
            );

            for (const formExtension of extensions) {
                const extendedFormFields = await formExtension.getFormFieldExtensions();

                for (const fieldExtension of extendedFormFields) {
                    const configuration = formConfigurations.find((c) => c.id === fieldExtension.groupId);
                    if (configuration) {
                        const groupConfiguration = configuration as FormGroupConfiguration;
                        if (!groupConfiguration.fieldConfigurationIds) {
                            groupConfiguration.fieldConfigurationIds = [];
                        }

                        const index = groupConfiguration.fieldConfigurationIds.findIndex(
                            (id) => id === fieldExtension.afterFieldId
                        );
                        if (index !== -1) {
                            groupConfiguration.fieldConfigurationIds.splice(
                                index + 1, 0, fieldExtension.configuration.id
                            );
                        } else {
                            groupConfiguration.fieldConfigurationIds.push(fieldExtension.configuration.id);
                        }

                        formConfigurations.push(fieldExtension.configuration);
                    }
                }
            }
        }
    }

    private static getPlugins(): any[] {
        const plugins = [];
        const availablePlugins = PluginService.getInstance().availablePlugins;
        for (const plugin of availablePlugins) {
            plugins.push({
                Product: plugin[1].product,
                Requires: plugin[1].requires,
                Description: plugin[1].product,
                BuildNumber: plugin[1].buildNumber,
                Version: plugin[1].version,
                ExtendedData: {
                    BuildDate: plugin[1].buildDate
                }
            });
        }
        return plugins;
    }
}
