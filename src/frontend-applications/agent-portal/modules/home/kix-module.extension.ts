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

class Extension implements IKIXModuleExtension {

    public webDependencies: string[] = [
        './home/webapp'
    ];

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'home-module';

    public initComponents: UIComponent[] = [
        new UIComponent('home-module', '/kix-module-home$0/webapp/core/HomeUIModule', [])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('home', '/kix-module-home$0/webapp/components/home-module', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
