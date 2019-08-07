/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ProfilingService, AuthenticationService,
} from '../core/services';
import { SocketEvent, ISocketRequest } from '../core/model';
import { ISocketNamespace, SocketResponse } from '../core/common';

export abstract class SocketNameSpace implements ISocketNamespace {

    protected abstract getNamespace(): string;

    protected abstract registerEvents(client: SocketIO.Socket): void;

    protected namespace: SocketIO.Namespace;

    public registerNamespace(server: SocketIO.Server): void {
        this.namespace = server.of('/' + this.getNamespace());
        this.namespace
            .use(AuthenticationService.getInstance().isSocketAuthenticated.bind(AuthenticationService.getInstance()))
            .on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
                this.registerEvents(client);
            });
    }

    protected registerEventHandler<RQ extends ISocketRequest, RS>(
        client: SocketIO.Socket, event: string, handler: (data: RQ) => Promise<SocketResponse<RS>>
    ): void {
        client.on(event, (data: RQ) => {

            // start profiling

            const logData = {};
            for (const key in data as any) {
                if (key !== 'token') {
                    if (key.match(/password/i)) {
                        logData[key] = '*****';
                    } else {
                        logData[key] = data[key];
                    }
                }
            }

            const message = `${this.getNamespace()} / ${event} ${JSON.stringify(logData)}`;
            const profileTaskId = ProfilingService.getInstance().start('SocketIO', message, data);

            handler(data).then((response) => {
                client.emit(response.event, response.data);

                // stop profiling
                ProfilingService.getInstance().stop(profileTaskId, response.data);
            });

        });
    }
}
