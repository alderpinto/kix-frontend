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
    TicketProperty, FormFieldValue, FormInputComponent,
    KIXObjectType, Organisation, TreeNode, Contact, TreeHandler
} from "../../../../../core/model";
import { FormService } from "../../../../../core/browser/form";
import { IdService, KIXObjectService, LabelService } from "../../../../../core/browser";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import { FormFieldConfiguration } from "../../../../../core/model/components/form/configuration";

class Component extends FormInputComponent<number, ComponentState> {

    private organisations: Organisation[] = [];
    private formListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.setCurrentNode.bind(this);
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        this.state.placeholder = await TranslationService.translate('Translatable#Please select a contact');

    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.formListenerId = IdService.generateDateBasedId('TicketOrganisationInput');
        await FormService.getInstance().registerFormInstanceListener(this.state.formId, {
            formListenerId: this.formListenerId,
            formValueChanged: this.formValueChanged.bind(this),
            updateForm: () => { return; }
        });
        this.setCurrentNode();
    }

    private async formValueChanged(formField: FormFieldConfiguration, value: FormFieldValue<any>): Promise<void> {
        if (formField && formField.property === TicketProperty.CONTACT_ID) {
            if (value.value) {
                this.setOrganisationsByContact(value);
            } else {
                this.state.hasContact = false;
                super.provideValue(null);
            }
        }
    }

    public async setCurrentNode(): Promise<TreeNode[]> {
        let nodes = [];
        if (this.state.defaultValue) {
            const organisationId = this.state.defaultValue.value;
            if (organisationId) {
                if (!isNaN(organisationId)) {
                    const organisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, [organisationId]
                    );

                    if (organisations && organisations.length) {
                        const organisation = organisations[0];

                        const displayValue = await LabelService.getInstance().getText(organisation);

                        const currentNode = new TreeNode(organisation.ID, displayValue, 'kix-icon-man-bubble');
                        nodes = [currentNode];
                        super.provideValue(organisation.ID);
                    }
                } else {
                    const currentNode = new TreeNode(
                        organisationId, organisationId.toString(), 'kix-icon-man-bubble'
                    );

                    nodes = [currentNode];
                    super.provideValue(organisationId);
                }
            }
        }
        return nodes;
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
        FormService.getInstance().removeFormInstanceListener(this.state.formId, this.formListenerId);
    }

    public nodesChanged(nodes: TreeNode[]): void {
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(currentNode ? currentNode.id : null);
    }

    private async setOrganisationsByContact(contactValue: FormFieldValue): Promise<void> {
        if (!isNaN(contactValue.value)) {
            const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, [contactValue.value]);
            if (contacts && contacts.length) {
                const contact = contacts[0];
                this.state.primaryOrganisationId = contact.PrimaryOrganisationID;
                await this.loadOrganisations(contact.OrganisationIDs);
            }
        } else {
            const currentNode = new TreeNode(contactValue.value, contactValue.value, 'kix-icon-man-house');

            const formList = (this as any).getComponent('organisation-form-list');
            if (formList) {
                const treeHandler: TreeHandler = formList.getTreeHandler();
                if (treeHandler) {
                    currentNode.selected = true;
                    treeHandler.setTree([currentNode]);
                }
            }
            super.provideValue(currentNode ? currentNode.id : null);
        }
        this.state.hasContact = true;
    }

    private async loadOrganisations(organisationIds: number[]): Promise<void> {
        this.organisations = await KIXObjectService.loadObjects<Organisation>(
            KIXObjectType.ORGANISATION, organisationIds
        );

        const nodes = [];
        for (const o of this.organisations) {
            const displayValue = await LabelService.getInstance().getText(o);
            nodes.push(new TreeNode(o.ID, displayValue, 'kix-icon-man-house'));
        }

        const currentNode = nodes.find((i) => i.id === this.state.primaryOrganisationId);
        if (currentNode) {
            currentNode.selected = true;
        }

        const formList = (this as any).getComponent('organisation-form-list');
        if (formList) {
            const treeHandler: TreeHandler = formList.getTreeHandler();
            if (treeHandler) {
                currentNode.selected = true;
                treeHandler.setTree(nodes);
            }
        }
        this.nodesChanged([currentNode]);
    }
}

module.exports = Component;
