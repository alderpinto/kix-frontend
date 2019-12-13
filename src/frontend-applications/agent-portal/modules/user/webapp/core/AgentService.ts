/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AgentSocketClient } from './AgentSocketClient';
import { User } from '../../model/User';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AuthenticationSocketClient } from '../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { PersonalSetting } from '../../model/PersonalSetting';
import { PersonalSettingsProperty } from '../../model/PersonalSettingsProperty';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../../modules/base-components/webapp/core/ServiceType';
import { IKIXObjectFormService } from '../../../../modules/base-components/webapp/core/IKIXObjectFormService';

export class AgentService extends KIXObjectService<User> {

    private static INSTANCE: AgentService = null;

    public static getInstance(): AgentService {
        if (!AgentService.INSTANCE) {
            AgentService.INSTANCE = new AgentService();
        }

        return AgentService.INSTANCE;
    }

    public getLinkObjectName(): string {
        return 'User';
    }

    public isServiceFor(kixObjectType: KIXObjectType | string) {
        return kixObjectType === KIXObjectType.USER ||
            kixObjectType === KIXObjectType.PERSONAL_SETTINGS;
    }

    public async login(userName: string, password: string, redirectUrl: string): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().login(userName, password, redirectUrl);
    }

    public async getPersonalSettings(): Promise<PersonalSetting[]> {
        return await AgentSocketClient.getInstance().getPersonalSettings();
    }

    public async getCurrentUser(useCache: boolean = true): Promise<User> {
        const currentUser = await AgentSocketClient.getInstance().getCurrentUser(useCache);
        return currentUser;
    }

    public async setPreferencesByForm(formId: string): Promise<void> {
        const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(KIXObjectType.USER, ServiceType.FORM);
        const parameter: Array<[string, any]> = await service.prepareFormFields(formId);

        const queuesParameter = parameter.find((p) => p[0] === PersonalSettingsProperty.MY_QUEUES);
        if (queuesParameter) {
            queuesParameter[1] = Array.isArray(queuesParameter[1]) ? queuesParameter[1].join(',') : queuesParameter[1];
        }

        const notificationIndex = parameter.findIndex((p) => p[0] === PersonalSettingsProperty.NOTIFICATIONS);
        if (notificationIndex !== -1 && Array.isArray(parameter[notificationIndex][1])) {
            const transport = 'Email';
            const notificationValues: Array<[string, number[]]> = parameter[notificationIndex];

            const notificationPreference = {};
            notificationValues[1].forEach((e) => {
                const eventKey = `Notification-${e}-${transport}`;
                notificationPreference[eventKey] = 1;
            });

            parameter.splice(notificationIndex, 1);
            parameter.push([PersonalSettingsProperty.NOTIFICATIONS, JSON.stringify(notificationPreference)]);
        }

        await AgentSocketClient.getInstance().setPreferences(parameter);
    }

    public async setPreferences(preferences: Array<[string, any]>): Promise<void> {
        const parameter: Array<[string, any]> = Array.isArray(preferences) ? preferences : [];

        if (!!parameter.length) {
            await AgentSocketClient.getInstance().setPreferences(parameter);
        }
    }

    public async checkPassword(password: string): Promise<boolean> {
        const user = await this.getCurrentUser();
        return await AuthenticationSocketClient.getInstance().login(user.UserLogin, password, null, true);
    }
}