/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'webform-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('webform-component', '/kix-module-webform$0/webapp/core/WebformUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('admin-webforms', '/kix-module-webform$0/webapp/components/admin-webforms', []),
        new UIComponent('new-webform-dialog', '/kix-module-webform$0/webapp/components/new-webform-dialog', []),
        new UIComponent('webform-code-widget', '/kix-module-webform$0/webapp/components/webform-code-widget', []),
        new UIComponent('webform-code-content', '/kix-module-webform$0/webapp/components/webform-code-content', []),
        new UIComponent('edit-webform-dialog', '/kix-module-webform$0/webapp/components/edit-webform-dialog', [])
    ];

    public webDependencies: string[] = [
        './webform/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
