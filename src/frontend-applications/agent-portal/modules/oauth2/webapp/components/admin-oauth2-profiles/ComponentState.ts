/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { OAuth2ProfileProperty } from '../../../model/OAuth2ProfileProperty';
import { SortOrder } from '../../../../../model/SortOrder';

export class ComponentState {
    public constructor(
        public instanceId: string = 'communication-oauth2-profiles-list',
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(null, null, null,
            'table-widget', 'Translatable#Communication: Email: OAuth2 Profiles',
            [
                'oauth2-profile-create', 'oauth2-profile-table-renew', 'oauth2-profile-table-delete',
                'csv-export-action'
            ], null,
            new TableWidgetConfiguration(
                null, null, null, KIXObjectType.OAUTH2_PROFILE,
                [OAuth2ProfileProperty.NAME, SortOrder.UP]
            ), false, false, 'kix-icon-gears'
        )
    ) { }

}
