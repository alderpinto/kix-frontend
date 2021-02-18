/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { AdministrationSocketClient } from '../../core/AdministrationSocketClient';
import { AdminContext } from '../../core/AdminContext';
import { AdminModule } from '../../../model/AdminModule';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { AdminModuleCategory } from '../../../model/AdminModuleCategory';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { AuthenticationSocketClient } from '../../../../base-components/webapp/core/AuthenticationSocketClient';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        if (context) {
            this.state.filterValue = context.getAdditionalInformation('EXPLORER_FILTER_ADMIN');
            if (this.state.filterValue) {
                const filter = (this as any).getComponent('admin-modules-explorer-filter');
                if (filter) {
                    filter.textFilterValueChanged(null, this.state.filterValue);
                }
            }
            this.state.widgetConfiguration = await context.getWidgetConfiguration(this.state.instanceId);

            const categories = await AdministrationSocketClient.getInstance().loadAdminCategories();

            if (categories) {
                await this.prepareCategoryTreeNodes(categories);
            }

            setTimeout(() => {
                this.setActiveNode(context.adminModuleId);
            }, 500);
        }
    }

    private setActiveNode(adminModuleId: string): void {
        this.activeNodeChanged(this.getActiveNode(adminModuleId));
    }

    private getActiveNode(adminModuleId: string, nodes: TreeNode[] = this.state.nodes): TreeNode {
        let activeNode = nodes.find((n) => n.id === adminModuleId);
        if (!activeNode) {
            for (const node of nodes) {
                if (node.children && node.children.length) {
                    activeNode = this.getActiveNode(adminModuleId, node.children);
                }
                if (activeNode) {
                    node.expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    private async prepareCategoryTreeNodes(
        modules: Array<AdminModuleCategory | AdminModule>, parent?: TreeNode
    ): Promise<void> {
        const adminModules: TreeNode[] = [];
        if (modules) {

            for (const m of modules) {
                if (m instanceof AdminModuleCategory) {
                    const name = await TranslationService.translate(m.name);
                    const categoryNode = new TreeNode(
                        m.id, name, m.icon, null,
                        [], null, null, null, null, false, true, true
                    );
                    this.prepareCategoryTreeNodes(m.children, categoryNode);
                    this.prepareModuleTreeNodes(m.modules, categoryNode);
                    if (parent) {
                        parent.children.push(categoryNode);
                    } else {
                        this.state.nodes.push(categoryNode);
                        this.sortNodes();
                        (this as any).setStateDirty('nodes');
                    }
                } else {
                    const allowed = await AuthenticationSocketClient.getInstance().checkPermissions(m.permissions);
                    if (allowed) {
                        const name = await TranslationService.translate(m.name);
                        this.state.nodes.push(new TreeNode(
                            m.id, name, m.icon,
                            undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                            undefined, undefined, undefined,
                            ['MODULE']
                        ));
                        this.sortNodes();
                        (this as any).setStateDirty('nodes');
                    }
                }
            }
        }
    }

    private async prepareModuleTreeNodes(modules: AdminModule[], parent?: TreeNode): Promise<void> {
        for (const m of modules) {
            const allowed = await AuthenticationSocketClient.getInstance().checkPermissions(m.permissions);
            if (allowed) {
                const name = await TranslationService.translate(m.name);
                const node = new TreeNode(
                    m.id, name, m.icon,
                    undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                    undefined, undefined, undefined,
                    ['MODULE']
                );
                if (parent) {
                    parent.children.push(node);
                } else {
                    this.state.nodes.push(node);
                    this.sortNodes();
                    (this as any).setStateDirty('nodes');
                }
            }
        }
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;
        if (node) {
            const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
            if (context) {
                context.setAdminModule(node.id, node.parent ? node.parent.label : '');
            }
        }
    }

    public async filter(textFilterValue?: string): Promise<void> {
        this.state.filterValue = textFilterValue;
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        if (context) {
            context.setAdditionalInformation('EXPLORER_FILTER_ADMIN', this.state.filterValue);
        }
    }

    private sortNodes(nodes: TreeNode[] = this.state.nodes): TreeNode[] {
        return nodes.sort((a, b) => {
            if (a.children) {
                a.children = this.sortNodes(a.children);
            }

            if (a.flags.some((f) => f === 'MODULE') && !b.flags.some((f) => f === 'MODULE')) {
                return -1;
            } else if (!a.flags.some((f) => f === 'MODULE') && b.flags.some((f) => f === 'MODULE')) {
                return 1;
            } else {
                return a.label.localeCompare(b.label);
            }
        });
    }

}

module.exports = Component;
