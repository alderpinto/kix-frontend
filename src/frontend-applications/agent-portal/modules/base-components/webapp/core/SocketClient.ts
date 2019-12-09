/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ClientStorageService } from "./ClientStorageService";

declare var io: any;

export abstract class SocketClient {

    protected socket: SocketIO.Server;

    protected createSocket(namespace: string, authenticated: boolean = true): SocketIO.Server {
        const socketUrl = ClientStorageService.getFrontendSocketUrl();

        const options = {};

        if (authenticated) {
            const token = ClientStorageService.getToken();
            options['query'] = "Token=" + token;
        }

        let socket;
        if (typeof io !== 'undefined') {
            socket = io.connect(socketUrl + "/" + namespace, options);
            socket.on('error', (error) => {
                console.error(namespace);
                console.error(error);
            });

            socket.on('disconnect', () => {
                console.error(namespace);
                console.warn('Disconnected from frontend server. Reconnect');
                socket.open();
            });

            socket.on('reconnect', (number: number) => {
                console.error(namespace);
                console.warn('Reconnect attempt: ' + number);
            });

            socket.on('reconnect_attempt', () => {
                console.error(namespace);
                console.warn('Reconnect attempt');
            });


            socket.on('reconnect_error', (error) => {
                console.error(namespace);
                console.error('reconnect_error');
                console.error(error);
            });

            socket.on('reconnect_failed', (attempts) => {
                console.error(namespace);
                console.error('reconnect_failed: ' + attempts);
            });
        }

        return socket;
    }

}
