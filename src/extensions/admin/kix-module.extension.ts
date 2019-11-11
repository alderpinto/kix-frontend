/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
        new UIComponent('system-admin-console', 'admin/system-admin-console', []),
        new UIComponent('i18n-admin-translations', 'i18n/admin/i18n-admin-translations', []),
        new UIComponent('new-translation-dialog', 'i18n/admin/dialogs/new-translation-dialog', []),
        new UIComponent('edit-translation-dialog', 'i18n/admin/dialogs/edit-translation-dialog', []),
        new UIComponent(
            'i18n-translation-language-list-widget', 'i18n/admin/widgets/i18n-translation-language-list-widget', []
        ),
        new UIComponent(
            'i18n-translation-info-widget', 'i18n/admin/widgets/i18n-translation-info-widget', []
        ),
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
