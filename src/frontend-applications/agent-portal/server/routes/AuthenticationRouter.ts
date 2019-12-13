/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import path = require('path');

import { KIXRouter } from './KIXRouter';
import * as Bowser from "bowser";
import { ReleaseInfoUtil } from '../../../../server/ReleaseInfoUtil';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { SysConfigService } from '../../modules/sysconfig/server/SysConfigService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { SysConfigKey } from '../../modules/sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../modules/sysconfig/model/SysConfigOption';
import { PluginService } from '../../../../server/services/PluginService';
import { IFrontendServerExtension } from '../../../../server/model/IFrontendServerExtension';
import { IMarkoApplication } from '../extensions/IMarkoApplication';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { LoggingService } from '../../../../server/services/LoggingService';

export class AuthenticationRouter extends KIXRouter {

    private static INSTANCE: AuthenticationRouter;

    public static getInstance(): AuthenticationRouter {
        if (!AuthenticationRouter.INSTANCE) {
            AuthenticationRouter.INSTANCE = new AuthenticationRouter();
        }
        return AuthenticationRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected initialize(): void {
        this.router.get("/", this.login.bind(this));
    }

    public getContextId(): string {
        return "authentication";
    }

    public getBaseRoute(): string {
        return "/auth";
    }

    public async login(req: Request, res: Response): Promise<void> {
        if (this.isUnsupportedBrowser(req)) {
            res.redirect('/static/html/unsupported-browser/index.html');
        } else {

            const applications = await PluginService.getInstance().getExtensions<IMarkoApplication>(
                AgentPortalExtensions.MARKO_APPLICATION
            );

            const app = applications.find((a) => a.name === 'authentication-login');

            if (app) {
                try {
                    const folder = app.internal ? 'modules' : 'plugins';
                    const templatePath = path.join(__dirname, '..', '..', folder, app.name, app.path);

                    const template = require(templatePath);
                    this.setFrontendSocketUrl(res);

                    const logout = req.query.logout !== undefined;

                    const releaseInfo = await ReleaseInfoUtil.getInstance().getReleaseInfo();

                    const imprintLink = await this.getImprintLink()
                        .catch((e) => '');

                    let redirectUrl = '/';
                    if (req.url !== '/auth') {
                        redirectUrl = req.url;
                    }

                    res.marko(template, {
                        login: true, logout, releaseInfo, imprintLink, redirectUrl
                    });
                } catch (error) {
                    console.error(error);
                    LoggingService.getInstance().error(error);
                    res.status(404).send();
                }
            } else {
                res.status(404).send();
            }
        }
    }

    private isUnsupportedBrowser(req: Request): boolean {
        const browser = Bowser.getParser(req.headers['user-agent']);
        const requesteBrowser = browser.getBrowser();
        const unsupported = requesteBrowser.name === 'Internet Explorer' && requesteBrowser.version === '11.0';
        return unsupported;
    }

    private async getImprintLink(): Promise<string> {
        let imprintLink = '';
        const config = ConfigurationService.getInstance().getServerConfiguration();
        const imprintConfig = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
            config.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.IMPRINT_LINK],
            undefined, undefined
        );

        if (imprintConfig && imprintConfig.length) {
            const data = imprintConfig[0].Value;

            const defaultLangConfig = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                config.BACKEND_API_TOKEN, '', KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.DEFAULT_LANGUAGE],
                undefined, undefined
            );

            if (defaultLangConfig && defaultLangConfig.length) {
                imprintLink = data[defaultLangConfig[0].Value];
            } else {
                imprintLink = data['en'];
            }
        }

        return imprintLink;
    }

}