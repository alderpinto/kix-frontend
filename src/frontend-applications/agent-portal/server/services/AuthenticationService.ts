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

import jwt = require('jsonwebtoken');
import cookie = require('cookie');

export class AuthenticationService {

    private static INSTANCE: AuthenticationService;

    public static getInstance(): AuthenticationService {
        if (!AuthenticationService.INSTANCE) {
            AuthenticationService.INSTANCE = new AuthenticationService();
        }
        return AuthenticationService.INSTANCE;
    }

    private backendCallbackToken: string;

    private tokenSecret: string;

    private constructor() {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        this.tokenSecret = config.FRONTEND_TOKEN_SECRET;

        this.backendCallbackToken = jwt.sign({ name: 'backen-callback', created: Date.now() }, this.tokenSecret);
    }

    private createToken(userLogin: string, backendToken: string, remoteAddress: string): string {
        const token = jwt.sign({ userLogin, remoteAddress, backendToken, created: Date.now() }, this.tokenSecret);
        return token;
    }

    public getBackendToken(token: string): string {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        if (serverConfig.BACKEND_API_TOKEN === token) {
            return token;
        }

        const decoded = this.decodeToken(token);
        return decoded && decoded.backendToken ? decoded.backendToken : null;
    }

    private decodeToken(token: string): FrontendToken {
        return jwt.decode(token, this.tokenSecret);
    }

    public async validateToken(token: string, remoteAddress: string): Promise<boolean> {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        if (config.CHECK_TOKEN_ORIGIN) {
            const decodedToken = this.decodeToken(token);
            if (decodedToken.remoteAddress !== remoteAddress) {
                return false;
            }
        }

        return new Promise<boolean>((resolve, reject) => {
            HttpService.getInstance().get<SessionResponse>(
                'session', {}, token, null, null, false
            ).then((response: SessionResponse) => {
                resolve(
                    typeof response !== 'undefined' && response !== null &&
                    typeof response.Session !== 'undefined' && response.Session !== null
                );
            }).catch((error) => {
                resolve(false);
            });
        });
    }

    public getCallbackToken(): string {
        return this.backendCallbackToken;
    }

    public async isAuthenticated(req: Request, res: Response, next: () => void): Promise<void> {
        const token: string = req.cookies.token;
        if (token) {
            const remoteAddress = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                (req.connection.socket ? req.connection.socket.remoteAddress : null);

            this.validateToken(token, remoteAddress).then((valid) => {
                if (valid) {
                    res.cookie('token', token, { httpOnly: true });
                    next();
                } else {
                    AuthenticationRouter.getInstance().login(req, res);
                }
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
        const parsedCookie = cookie.parse(socket.handshake.headers.cookie);
        const token = parsedCookie.token;
        if (token) {
            this.validateToken(token, socket.handshake.address)
                .then((valid) => valid ? next() : next(new SocketAuthenticationError('Invalid Token!')))
                .catch(() => next(new SocketAuthenticationError('Error validating token!')));

        } else {
            next(new SocketAuthenticationError('Invalid Token!'));
        }
    }

    public async login(
        user: string, password: string, clientRequestId: string, remoteAddress: string, fakeLogin?: boolean
    ): Promise<string> {
        const userLogin = new UserLogin(user, password, UserType.AGENT);
        const response = await HttpService.getInstance().post<LoginResponse>(
            'auth', userLogin, null, clientRequestId, undefined, false
        );
        const token = fakeLogin ? response.Token : this.createToken(user, response.Token, remoteAddress);
        return token;
    }

    public async logout(token: string): Promise<boolean> {
        const backendToken = this.getBackendToken(token);
        await HttpService.getInstance().delete(['session'], backendToken, null).catch((error) => null);
        return true;
    }
}

// tslint:disable-next-line: max-classes-per-file
class FrontendToken {
    public userLogin: string;
    public remoteAddress: string;
    public backendToken: string;
    public created: number;
}
