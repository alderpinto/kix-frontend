/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../model/IKIXModuleExtension";
import { UIComponent } from "../../model/UIComponent";
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { CRUD } from "../../../../server/model/rest/CRUD";

class Extension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'import-export-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('import-export-component', '/kix-module-import-export$0/webapp/core/ImportExportUIModule', [
            new UIComponentPermission(
                'system/importexport/templates', [CRUD.READ]
            ),
            new UIComponentPermission(
                'system/importexport/templates/*/runs', [CRUD.CREATE]
            )
        ])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'admin-import-export-templates',
            '/kix-module-import-export$0/webapp/components/admin-import-export-templates',
            []
        ),
        new UIComponent(
            'template-import-content',
            '/kix-module-import-export$0/webapp/components/template-import-content',
            []
        )
    ];

    public webDependencies: string[] = [
        './import-export/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
