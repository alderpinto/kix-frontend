import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { CRUD } from "../../core/model";

class Extension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public id = 'application-admin-module';

    public initComponents: UIComponent[] = [
        new UIComponent('admin-module-component', 'core/browser/modules/ui-modules/AdminUIModule', []),
        new UIComponent('system-module-component', 'core/browser/modules/ui-modules/SystemUIModule', [
            new UIComponentPermission('system/config/*', [CRUD.UPDATE], true)
        ])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('admin', 'admin/admin-module', []),
        new UIComponent('admin-modules-explorer', 'admin/widgets/admin-modules-explorer', []),
        new UIComponent('permissions-form-input', 'permission/admin/dialogs/inputs/permissions-form-input', []),
        new UIComponent('permission-input', 'permission/admin/dialogs/inputs/permission-input', []),
        new UIComponent(
            'assign-role-permission-input',
            'permission/admin/dialogs/inputs/assign-role-permission-input',
            []
        ),
        new UIComponent('system-admin-sysconfig', 'system/admin/system-admin-sysconfig', []),
        new UIComponent('system-admin-logs', 'admin/system-admin-logs', []),
        new UIComponent('i18n-admin-translations', 'i18n/admin/i18n-admin-translations', []),
        new UIComponent('new-translation-dialog', 'i18n/admin/dialogs/new-translation-dialog', []),
        new UIComponent('edit-translation-dialog', 'i18n/admin/dialogs/edit-translation-dialog', []),
        new UIComponent(
            'i18n-translation-language-list-widget', 'i18n/admin/widgets/i18n-translation-language-list-widget', []
        ),
        new UIComponent(
            'i18n-translation-info-widget', 'i18n/admin/widgets/i18n-translation-info-widget', []),
        new UIComponent('admin-notifications', 'notifications/admin/notifications', []),
        new UIComponent('new-notification-dialog', 'notifications/admin/dialogs/new-notification-dialog', []),
        new UIComponent(
            'notification-input-events',
            'notifications/admin/dialogs/inputs/notification-input-events',
            []
        ),
        new UIComponent(
            'notification-input-email-recipient',
            'notifications/admin/dialogs/inputs/notification-input-email-recipient',
            []
        ),
        new UIComponent(
            'notification-input-filter',
            'notifications/admin/dialogs/inputs/notification-input-filter',
            []
        )
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
