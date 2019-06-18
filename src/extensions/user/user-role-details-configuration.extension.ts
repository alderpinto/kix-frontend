import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, WidgetConfiguration, ConfiguredWidget, WidgetSize, TableWidgetSettings,
    KIXObjectType, PermissionProperty, SortOrder, TabWidgetSettings
} from '../../core/model';
import { TicketPriorityDetailsContext } from '../../core/browser/ticket';
import { RoleDetailsContext } from '../../core/browser/user';
import { TableConfiguration } from '../../core/browser';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return RoleDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('user-role-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['user-role-info-widget']))
        );

        const userRoleInfoWidget = new ConfiguredWidget('user-role-info-widget', new WidgetConfiguration(
            'user-role-info-widget', 'Translatable#Role Information', ['user-admin-role-edit-action'], null,
            false, true, WidgetSize.BOTH, false
        ));

        const assignedUsersWidget = new ConfiguredWidget('user-role-assigned-users-widget', new WidgetConfiguration(
            'user-role-assigned-users-widget', 'Translatable#Assigned Agents', [], null, true, true,
        ));

        const assignedPermissionsWidget = new ConfiguredWidget('user-role-assigned-permissions-widget',
            new WidgetConfiguration(
                'table-widget', 'Translatable#Permissions', [],
                new TableWidgetSettings(
                    KIXObjectType.ROLE_PERMISSION, [PermissionProperty.TYPE_ID, SortOrder.UP],
                    new TableConfiguration(KIXObjectType.ROLE_PERMISSION, null, null, null), null, false
                ),
                true, true, null, true
            ));

        return new ContextConfiguration(
            TicketPriorityDetailsContext.CONTEXT_ID,
            [], [],
            [], [],
            ['user-role-info-widget', 'user-role-assigned-permissions-widget', 'user-role-assigned-users-widget'],
            [tabLane, assignedPermissionsWidget, assignedUsersWidget, userRoleInfoWidget],
            [], [],
            ['user-admin-role-create-action'],
            ['user-admin-role-edit-action']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
