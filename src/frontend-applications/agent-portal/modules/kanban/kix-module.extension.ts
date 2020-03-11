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

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'kanban-module';

    public initComponents: UIComponent[] = [
        new UIComponent('kanban-component', '/kanban$0/webapp/core/KanbanUIModule', [])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('kanban-module', '/kanban$0/webapp/components/kanban-module', []),
        new UIComponent('kanban-widget', '/kanban$0/webapp/components/kanban-widget', []),
        new UIComponent('kanban-item', '/kanban$0/webapp/components/kanban-widget/kanban-item', [])
    ];

    public webDependencies: string[] = [
        './kanban/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
