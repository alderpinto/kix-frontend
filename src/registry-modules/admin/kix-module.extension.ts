import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class Extension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public id = 'application-admin-module';

    public initComponents: UIComponent[] = [
        new UIComponent('admin-module-component', 'admin/admin-module-component', [])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('admin', 'admin/admin-module', []),
        new UIComponent('admin-modules-explorer', 'admin/widgets/admin-modules-explorer', []),
        new UIComponent('i18n-admin-translations', 'i18n/admin/i18n-admin-translations', []),
        new UIComponent('new-translation-dialog', 'i18n/admin/dialogs/new-translation-dialog', []),
        new UIComponent('edit-translation-dialog', 'i18n/admin/dialogs/edit-translation-dialog', []),
        new UIComponent(
            'i18n-translation-language-list-widget', 'i18n/admin/widgets/i18n-translation-language-list-widget', []
        ),
        new UIComponent(
            'i18n-translation-info-widget', 'i18n/admin/widgets/i18n-translation-info-widget', []),
        new UIComponent(
            'communication-admin-system-addresses', 'communication/admin/communication-admin-system-addresses', []
        ),
        new UIComponent('system-address-info-widget', 'communication/admin/widgets/system-address-info-widget', []),
        new UIComponent(
            'system-address-assigned-queues-widget',
            'communication/admin/widgets/system-address-assigned-queues-widget',
            []
        ),
        new UIComponent('new-system-address-dialog', 'communication/admin/dialogs/new-system-address-dialog', []),
        new UIComponent('permissions-form-input', 'permission/admin/dialogs/inputs/permissions-form-input', []),
        new UIComponent('permission-input', 'permission/admin/dialogs/inputs/permission-input', []),
        new UIComponent(
            'assign-role-permission-input',
            'permission/admin/dialogs/inputs/assign-role-permission-input',
            []
        )
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
