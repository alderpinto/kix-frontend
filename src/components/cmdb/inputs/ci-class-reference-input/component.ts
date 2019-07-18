/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    FormInputComponent, TreeNode, ConfigItem, KIXObjectType
} from '../../../../core/model';
import { FormService } from '../../../../core/browser/form';
import { CMDBService } from '../../../../core/browser/cmdb';
import { KIXObjectService } from '../../../../core/browser';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component extends FormInputComponent<number, ComponentState> {

    private configItems: ConfigItem[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.searchCallback = this.searchConfigItems.bind(this);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();
        await this.setCurrentNode();
    }

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const configItemID = this.state.defaultValue.value;

            const configItems = await KIXObjectService.loadObjects<ConfigItem>(
                KIXObjectType.CONFIG_ITEM, [configItemID]
            );
            if (configItems && configItems.length) {
                this.state.currentNode = this.createTreeNode(configItems[0]);
                this.state.nodes = [this.state.currentNode];
            }
            super.provideValue(configItemID);
        }
    }

    public configItemChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        const configItemID = this.state.currentNode ? this.state.currentNode.id : null;
        super.provideValue(configItemID);
    }

    private async searchConfigItems(limit: number, searchValue: string): Promise<TreeNode[]> {
        this.state.nodes = [];
        const ciCLassOption = this.state.field.options.find((o) => o.option === 'CI_CLASS');
        if (ciCLassOption) {
            const ciClassNames = ciCLassOption.value as string[];

            this.configItems = await CMDBService.getInstance().searchConfigItemsByClass(
                ciClassNames, searchValue, limit
            );

            if (searchValue && searchValue !== '') {
                this.state.nodes = this.configItems.map(
                    (c) => this.createTreeNode(c)
                );
            }
        }

        return this.state.nodes;
    }

    private createTreeNode(configItem: ConfigItem): TreeNode {
        return new TreeNode(configItem.ConfigItemID, configItem.Name, 'kix-icon-ci');
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
