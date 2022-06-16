/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdminModuleCategory } from '../model/AdminModuleCategory';
import { PluginService } from '../../../../../server/services/PluginService';
import { IAdminModuleExtension } from './IAdminModuleExtension';
import { AdminModule } from '../model/AdminModule';
import { PermissionService } from '../../../server/services/PermissionService';
import { AgentPortalExtensions } from '../../../server/extensions/AgentPortalExtensions';

export class AdminModuleService {

    private static INSTANCE: AdminModuleService;

    public static getInstance(): AdminModuleService {
        if (!AdminModuleService.INSTANCE) {
            AdminModuleService.INSTANCE = new AdminModuleService();
        }
        return AdminModuleService.INSTANCE;
    }

    private constructor() { }

    public async getAdminModules(): Promise<Array<AdminModuleCategory | AdminModule>> {
        const moduleExtensions = await PluginService.getInstance().getExtensions<IAdminModuleExtension>(
            AgentPortalExtensions.ADMIN_MODULE
        );

        const categories: AdminModuleCategory[] = [];

        moduleExtensions.forEach((m) => {
            const moduleCategories = m.getAdminModules();
            moduleCategories.forEach((c) => this.mergeCategory(categories, c));
        });

        return categories;
    }

    private mergeCategory(categories: AdminModuleCategory[], module: AdminModuleCategory | AdminModule): void {
        if (module instanceof AdminModuleCategory) {
            const existingCategory = categories.find((c) => c.id === module.id);
            if (existingCategory) {
                if (module.children) {
                    if (!existingCategory.children) {
                        existingCategory.children = [];
                    }
                    module.children.forEach((c) => this.mergeCategory(existingCategory.children, c));
                }

                if (module.modules) {
                    if (!existingCategory.modules) {
                        existingCategory.modules = [];
                    }
                    module.modules.forEach((m) => existingCategory.modules.push(m));
                }
            } else {
                categories.push(module);
            }
        } else {
            categories.push(module);
        }
    }

}
