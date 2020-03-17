/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { AuthenticationRouter } from '../routes/AuthenticationRouter';
import { HttpService } from './HttpService';
import { SessionResponse } from '../model/SessionResponse';
import { LoginResponse } from '../model/LoginResponse';
import { SocketAuthenticationError } from '../../modules/base-components/webapp/core/SocketAuthenticationError';
import { UserLogin } from '../../modules/user/model/UserLogin';
import { UserType } from '../../modules/user/model/UserType';

export class AuthenticationService {

    private static INSTANCE: AuthenticationService;

    public static getInstance(): AuthenticationService {
        if (!AuthenticationService.INSTANCE) {
            AuthenticationService.INSTANCE = new AuthenticationService();
        }
        return AuthenticationService.INSTANCE;
    }

    private frontendTokenCache: Map<string, string> = new Map();

    private backendCallbackToken: string;

    private constructor(private tokenKey = 'kix18-webfrontend-token-key') {
        const jwt = require('jsonwebtoken');
        this.backendCallbackToken = jwt.sign({ name: 'backen-callback', created: Date.now() }, this.tokenKey);
    }

    public getBackendToken(token: string): string {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        if (serverConfig.BACKEND_API_TOKEN === token) {
            return token;
        }

        return this.frontendTokenCache.get(token);
    }

    public getCallbackToken(): string {
        return this.backendCallbackToken;
    }

    public async isAuthenticated(req: Request, res: Response, next: () => void): Promise<void> {
        const token: string = req.cookies.token;
        if (token) {
            this.validateToken(token).then((valid) => {
                valid ? next() : AuthenticationRouter.getInstance().login(req, res);
            }).catch((error) => {
                AuthenticationRouter.getInstance().login(req, res);
            });
        } else {
            AuthenticationRouter.getInstance().login(req, res);
        }
    }

    public async isCallbackAuthenticated(req: Request, res: Response, next: () => void): Promise<void> {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
            const token = req.headers.authorization.split(' ')[1];
            if (token) {
                if (token === this.backendCallbackToken) {
                    next();
                } else {
                    res.status(401).send('Not authorized!');
                }
            }
        } else {
            res.status(403).send();
        }
    }

    public async isSocketAuthenticated(socket: SocketIO.Socket, next: (err?: any) => void): Promise<void> {
        if (socket.handshake.query) {
            const token = socket.handshake.query.Token;
            if (token) {
                this.validateToken(token)
                    .then((valid) => valid ? next() : next(new SocketAuthenticationError('Invalid Token!')))
                    .catch(() => new SocketAuthenticationError('Error validating token!'));

            } else {
                next(new SocketAuthenticationError('Invalid Token!'));
            }
        } else {
            next(new SocketAuthenticationError('Missing Token!'));
        }
    }

    public async login(
        user: string, password: string, clientRequestId: string, fakeLogin?: boolean
    ): Promise<string> {
        const userLogin = new UserLogin(user, password, UserType.AGENT);
        const response = await HttpService.getInstance().post<LoginResponse>(
            'auth', userLogin, null, clientRequestId, undefined, false
        );
        const token = fakeLogin ? response.Token : this.createToken(user, response.Token);
        return token;
    }

    public async logout(token: string): Promise<boolean> {
        if (this.frontendTokenCache.has(token)) {
            const backendToken = this.frontendTokenCache.get(token);
            await HttpService.getInstance().delete(['session'], backendToken, null).catch((error) => {
                // do nothing
            });
            this.frontendTokenCache.delete(token);
        }
        return true;
    }

    public async validateToken(token: string): Promise<boolean> {
        if (this.frontendTokenCache.has(token)) {
            return new Promise<boolean>((resolve, reject) => {
                HttpService.getInstance().get<SessionResponse>(
                    'session', {}, token, null, null, false
                ).then((response: SessionResponse) => {
                    resolve(
                        typeof response !== 'undefined' && response !== null &&
                        typeof response.Session !== 'undefined' && response.Session !== null
                    );
                }).catch(() => {
                    this.frontendTokenCache.delete(token);
                    resolve(false);
                });
            });
        } else {
            return false;
        }
    }

    private createToken(userLogin: string, backendToken: string): string {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ userLogin, created: Date.now() }, this.tokenKey);
        this.frontendTokenCache.set(token, backendToken);
        return token;
    }
}
