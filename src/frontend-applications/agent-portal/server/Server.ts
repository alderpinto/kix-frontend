/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import path from 'path';

import express from 'express';

require('@marko/compiler/register')({ meta: true });
import markoExpress from '@marko/express';

import { serveStatic } from 'lasso/middleware';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import forceSSl from 'express-force-ssl';
import { LoggingService } from '../../../server/services/LoggingService';
import { IServerConfiguration } from '../../../server/model/IServerConfiguration';
import { ConfigurationService } from '../../../server/services/ConfigurationService';
import { ServerRouter } from './routes/ServerRouter';
import { PluginService } from '../../../server/services/PluginService';
import { AgentPortalExtensions } from './extensions/AgentPortalExtensions';
import { IServer } from '../../../server/model/IServer';
import { IServiceExtension } from './extensions/IServiceExtension';
import { AuthenticationService } from './services/AuthenticationService';
import { ClientRegistrationService } from './services/ClientRegistrationService';
import { MainMenuNamespace } from '../modules/agent-portal/server/MainMenuNamespace';
import { MarkoService } from './services/MarkoService';

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
        const dataDir = path.join(__dirname, '..', '..', '..', '..', 'data');
        ConfigurationService.getInstance().init(configDir, certDir, dataDir);

        const serviceExtensions = await PluginService.getInstance().getExtensions<IServiceExtension>(
            AgentPortalExtensions.SERVICES
        );

        process.on('unhandledRejection', (reason, promise) => {
            LoggingService.getInstance().error('An unhandledRejection occured:', reason);
            LoggingService.getInstance().error(reason.toString(), reason);
            console.error('Unhandled Rejection at: Promise', promise, 'reason:', reason);
            console.error(reason);
            // throw reason;
        });

        LoggingService.getInstance().info(`Initialize ${serviceExtensions.length} service extensions`);
        for (const extension of serviceExtensions) {
            await extension.initServices();
        }

        this.serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const backendToken = await AuthenticationService.getInstance().getCallbackToken();
        const promises = [
            ClientRegistrationService.getInstance().createClientRegistration(backendToken),
            MarkoService.getInstance().initializeMarkoApplications()
        ];

        await Promise.all(promises).catch((error) => {
            LoggingService.getInstance().error(error);
            process.exit(99);
        });

        MainMenuNamespace.getInstance().createDefaultConfiguration(this.serverConfig.BACKEND_API_TOKEN);
        await this.initializeApplication();
    }

    public async initializeApplication(): Promise<void> {
        this.application = express();

        this.application.use(compression());
        this.application.use(express.json({ limit: '50mb' }));
        this.application.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.application.use(cookieParser());

        const httpsPort = this.serverConfig.HTTPS_PORT || 3001;

        if (this.serverConfig.USE_SSL) {
            this.application.set('forceSSLOptions', {
                httpsPort,
                sslRequiredMessage: 'SSL Required.'
            });
            this.application.use(forceSSl);
        }

        this.application.use(markoExpress());
        this.application.use(serveStatic());
        this.application.use(express.static('../static/'));

        const router = new ServerRouter(this.application);
        await router.initializeRoutes();
    }

}
