/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../../base-components/webapp/core/AbstractComponentState';
import { ObjectIcon } from '../../../../../../icon/model/ObjectIcon';
import { PortalNotification } from '../../../../../../portal-notification/model/PortalNotification';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public notifications: Array<[string, PortalNotification[]]> = [],
        public notificationIcon: ObjectIcon | string = null,
        public notificationClass: string = '',
        public notificationsCount: number = 0
    ) {
        super();
    }

}
