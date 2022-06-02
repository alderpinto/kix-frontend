/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from './services/ConfigurationService';
import { LoggingService } from './services/LoggingService';

const cluster = require('cluster');
const http = require('http');
const https = require('https');
const fs = require('fs');

import { Server as SocketServer } from 'socket.io';
const { setupMaster, setupWorker } = require('@socket.io/sticky');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');

import { cpus } from 'node:os';
import express from 'express';
import { MigrationService } from '../frontend-applications/agent-portal/migrations/MigrationService';
import { IInitialDataExtension } from '../frontend-applications/agent-portal/model/IInitialDataExtension';
import { AgentPortalExtensions } from '../frontend-applications/agent-portal/server/extensions/AgentPortalExtensions';
import { ClientRegistrationService } from '../frontend-applications/agent-portal/server/services/ClientRegistrationService';
import { MarkoService } from '../frontend-applications/agent-portal/server/services/MarkoService';
import { SocketService } from '../frontend-applications/agent-portal/server/services/SocketService';
import { PluginService } from './services/PluginService';
import { Server } from '../frontend-applications/agent-portal/server/Server';
import { AuthenticationService } from '../frontend-applications/agent-portal/server/services/AuthenticationService';

const path = require('path');

process.setMaxListeners(0);

async function initializeServer(): Promise<void> {
    const configDir = path.join(__dirname, '..', '..', 'config');
    const certDir = path.join(__dirname, '..', '..', 'cert');
    const dataDir = path.join(__dirname, '..', '..', 'data');
    ConfigurationService.getInstance().init(configDir, certDir, dataDir);

    LoggingService.getInstance().info('[SERVER] Start');

    const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

    if (serverConfig.CLUSTER_ENABLED) {
        if (cluster.isPrimary) {

            LoggingService.getInstance().info('CLUSTER - Master start');

            await initPlugins();
            await initializeFrontend();
            await initApplication();

            const httpServer = createHTTPServer();

            setupMaster(httpServer, {
                loadBalancingMethod: 'least-connection',
            });

            setupPrimary();

            const port = getPort();
            httpServer.listen(port);
            LoggingService.getInstance().info(`Frontend server is running on HTTPS: https://FQDN:${port}`);

            const numCPUs = serverConfig.CLUSTER_WORKER_COUNT || cpus().length;
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker) => {
                LoggingService.getInstance().info(`Worker ${worker.process.pid} died`);
                // cluster.fork();
            });

        } else {
            LoggingService.getInstance().info(`CLUSTER - Worker ${process.pid} started`);

            await initPlugins();
            await initApplication();

            const httpServer = createHTTPServer();
            const io = new SocketServer(httpServer);

            // use the cluster adapter
            io.adapter(createAdapter());

            // setup connection with the primary process
            setupWorker(io);

            await SocketService.getInstance().initialize(io);
        }
    } else {
        await initPlugins();
        await initializeFrontend();
        await initApplication();

        const httpServer = createHTTPServer();
        const io = require('socket.io')(httpServer);

        await SocketService.getInstance().initialize(io);

        const port = getPort();
        httpServer.listen(port);

        LoggingService.getInstance().info(`Frontend server is running on HTTPS: https://FQDN:${serverConfig.HTTPS_PORT}`);
    }
}

async function initPlugins(): Promise<void> {
    // load registered plugins
    const pluginDirs = [
        'frontend-applications',
        'frontend-applications/agent-portal/modules'
    ];
    await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));
}

async function initializeFrontend(): Promise<void> {

    await createClientRegistration();

    // create initial data
    const initialDataExtensions = await PluginService.getInstance().getExtensions<IInitialDataExtension>(
        AgentPortalExtensions.INITIAL_DATA
    );
    LoggingService.getInstance().info(`Create initial data (${initialDataExtensions.length} extensions)`);
    for (const extension of initialDataExtensions) {
        await extension.createData().catch((e) => {
            LoggingService.getInstance().error(`Error creating inital data: ${extension.name}.`, e);
        });
    }

    const success = await MigrationService.getInstance().startMigration();
    if (!success) {
        LoggingService.getInstance().error('Startup failed. Could not migrate!');
        process.exit(1);
    }
}

function getPort(): number {
    let port = 3001;
    const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
    if (serverConfig.USE_SSL) {
        port = serverConfig.HTTPS_PORT || 3001;
    } else {
        port = serverConfig.HTTP_PORT || 3000;
    }

    return port;
}

function createHTTPServer(): any {
    const options = {
        key: fs.readFileSync(path.join(__dirname, '..', '..', 'cert', 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, '..', '..', 'cert', 'cert.pem')),
        passphrase: 'kix2018'
    };

    const app = Server.getInstance().application || express();

    let server;
    const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
    if (serverConfig.USE_SSL) {
        server = https.createServer(options, app);
    } else {
        server = http.createServer(app);
    }

    return server;
}

async function initApplication(): Promise<void> {
    const configDir = path.join(__dirname, '..', '..', 'config');
    const certDir = path.join(__dirname, '..', '..', 'cert');
    const dataDir = path.join(__dirname, '..', '..', 'data');
    ConfigurationService.getInstance().init(configDir, certDir, dataDir);

    const pluginDirs = [
        'frontend-applications',
        'frontend-applications/agent-portal/modules'
    ];
    await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));

    await MarkoService.getInstance().initializeMarkoApplications();

    try {
        const startUpBegin = Date.now();
        await Server.getInstance().initServer();
        const startUpEnd = Date.now();
        LoggingService.getInstance().info(`[SERVER] Ready - Startup in ${(startUpEnd - startUpBegin) / 1000}s`);
    } catch (error) {
        LoggingService.getInstance().error('Could not initialize server');
        LoggingService.getInstance().error(error);
    }

}


async function createClientRegistration(): Promise<void> {
    LoggingService.getInstance().info('Create ClientRegsitration');

    const backendToken = await AuthenticationService.getInstance().getCallbackToken();
    await ClientRegistrationService.getInstance().createClientRegistration(backendToken)
        .catch((error) => {
            LoggingService.getInstance().error(error);
            LoggingService.getInstance().error(
                'Failed to register frontent server at backend (ClientRegistration). See errors above.'
            );
            process.exit(1);
        });

    LoggingService.getInstance().info('ClientRegistration created.');
}


initializeServer();