/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration
} from '../../core/model';
import { AdminContext } from '../../core/browser/admin';
import { ModuleConfigurationService } from '../../services';
import { ConfigurationType } from '../../core/model/configuration';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return AdminContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(token: string): Promise<ContextConfiguration> {
        const notesSidebar = new WidgetConfiguration(
            'admin-dashboard-notes-widget', 'Notes Widget', ConfigurationType.Widget,
            'notes-widget', 'Translatable#Notes', [], null, null, false, false, 'kix-icon-note', false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(notesSidebar);


        const adminModuleCategoriesExplorer = new WidgetConfiguration(
            'admin-dashboard-category-explorer', 'Category Explorer', ConfigurationType.Widget,
            'admin-modules-explorer', 'Translatable#Administration', [], null, null, false, false, null, false
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(adminModuleCategoriesExplorer);

        return new ContextConfiguration(
            this.getModuleId(), 'Admin Dashboard', ConfigurationType.Context,
            this.getModuleId(),
            [
                new ConfiguredWidget('admin-dashboard-notes-widget', 'admin-dashboard-notes-widget')
            ],
            [
                new ConfiguredWidget('admin-dashboard-category-explorer', 'admin-dashboard-category-explorer')
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
