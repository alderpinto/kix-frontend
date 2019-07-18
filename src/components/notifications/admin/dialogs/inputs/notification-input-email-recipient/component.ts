/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import {
    Contact, FormInputComponent, KIXObjectType, TreeNode, KIXObjectLoadingOptions,
    AutoCompleteConfiguration, FilterCriteria, ContactProperty, FilterDataType, FilterType,
    SystemAddress, ArticleReceiver
} from "../../../../../../core/model";
import { KIXObjectService, LabelService, SearchOperator } from "../../../../../../core/browser";
import { ContactService } from "../../../../../../core/browser/contact";

class Component extends FormInputComponent<string[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.searchCallback = this.searchContacts.bind(this);
        const objectName = await LabelService.getInstance().getObjectName(KIXObjectType.CONTACT, true, false);
        this.state.autoCompleteConfiguration = new AutoCompleteConfiguration(10, 2000, 3, objectName);

        this.setCurrentNodes();
    }

    public async setCurrentNodes(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const contactEmails: string[] = Array.isArray(this.state.defaultValue.value)
                ? this.state.defaultValue.value
                : (this.state.defaultValue.value as string).split(',').map((v) => v.trim());

            const nodes = [];
            const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                KIXObjectType.SYSTEM_ADDRESS
            );
            // TODO: nicht sehr performant
            for (const email of contactEmails) {
                const plainMail = email.replace(/.+ <(.+)>/, '$1');
                const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, null,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                ContactProperty.EMAIL, SearchOperator.EQUALS, FilterDataType.STRING,
                                FilterType.OR, plainMail
                            )
                        ]

                    ), null, true
                );
                if (contacts && !!contacts.length) {
                    nodes.push(await this.createTreeNode(contacts[0]));
                } else {
                    if (
                        !systemAddresses
                        || !!!systemAddresses.length
                        || !systemAddresses.map((sa) => sa.Name).some((f) => f === plainMail)
                    ) {
                        nodes.push(new TreeNode(plainMail, email, 'kix-icon-man-bubble'));
                    }
                }
            }
            this.state.nodes = nodes;
            this.emailChanged(nodes);
        }
    }

    public emailChanged(nodes: TreeNode[]): void {
        this.state.currentNodes = nodes && !!nodes.length ? nodes : [];
        super.provideValue(this.state.currentNodes.map((n) => n.id));
    }

    private async searchContacts(limit: number, searchValue: string): Promise<TreeNode[]> {
        const filter = await ContactService.getInstance().prepareFullTextFilter(searchValue);
        const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
        const contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, null, loadingOptions, null, false
        );

        this.state.nodes = [];
        if (searchValue && searchValue !== '') {
            const nodes = [];
            for (const c of contacts.filter((co) => co.Email)) {
                const node = await this.createTreeNode(c);
                nodes.push(node);
            }
            this.state.nodes = nodes;
        }

        return this.state.nodes;
    }

    private async createTreeNode(contact: Contact): Promise<TreeNode> {
        const displayValue = await LabelService.getInstance().getText(contact);
        return new TreeNode(
            contact.Email, displayValue, 'kix-icon-man-bubble', null, null, null,
            null, null, null, null, undefined, undefined, undefined,
            `"${contact.Firstname} ${contact.Lastname}" <${contact.Email}>`
        );
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;