/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    public id = 'system-log-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('system-log-component', '/kix-module-system-log$0/webapp/core/SystemLogUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('system-admin-logs', '/kix-module-system-log$0/webapp/components/system-admin-logs', [])
    ];

    public webDependencies: string[] = [
        './system-log/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
