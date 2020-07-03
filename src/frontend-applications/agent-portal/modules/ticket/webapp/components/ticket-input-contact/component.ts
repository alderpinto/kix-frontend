/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { FormInputAction } from '../../../../../modules/base-components/webapp/core/FormInputAction';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { PreviousTabData } from '../../../../../modules/base-components/webapp/core/PreviousTabData';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { TabContainerEvent } from '../../../../../modules/base-components/webapp/core/TabContainerEvent';
import { TabContainerEventData } from '../../../../../modules/base-components/webapp/core/TabContainerEventData';
import { TreeNode, TreeService } from '../../../../base-components/webapp/core/tree';
import { NewTicketDialogContext } from '../../core';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FormValidationService } from '../../../../../modules/base-components/webapp/core/FormValidationService';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { IKIXObjectService } from '../../../../../modules/base-components/webapp/core/IKIXObjectService';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { Contact } from '../../../../customer/model/Contact';
import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';

class Component extends FormInputComponent<number | string, ComponentState> {

    private contacts = [];

    public constructor() {
        super();
    }

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
        this.state.searchCallback = this.searchContacts.bind(this);
        this.state.autoCompleteConfiguration = new AutoCompleteConfiguration();

        const additionalTypeOption = this.state.field.options.find((o) => o.option === 'SHOW_NEW_CONTACT');
        const actions = [];
        if (additionalTypeOption && additionalTypeOption.value) {
            actions.push(new FormInputAction(
                'NEW_CONTACT',
                new Label(
                    null, 'NEW_CONTACT', 'kix-icon-man-bubble-new', null, null,
                    await TranslationService.translate('Translatable#New Contact')
                ),
                this.actionClicked.bind(this), false
            ));
        }

        this.state.actions = actions;
    }

    private async actionClicked(action: FormInputAction): Promise<void> {
        const context = await ContextService.getInstance().getContext(
            'new-contact-dialog-context'
        );
        if (context) {
            context.setAdditionalInformation('RETURN_TO_PREVIOUS_TAB', new PreviousTabData(
                KIXObjectType.TICKET,
                'new-ticket-dialog'
            ));
            EventService.getInstance().publish(
                TabContainerEvent.CHANGE_TAB, new TabContainerEventData('new-contact-dialog')
            );
        }
    }

    public async setCurrentValue(): Promise<void> {
        let nodes = [];
        const newTicketDialogContext = await ContextService.getInstance().getContext<NewTicketDialogContext>(
            NewTicketDialogContext.CONTEXT_ID
        );
        let contactId: number | string = null;
        if (newTicketDialogContext) {
            contactId = newTicketDialogContext.getAdditionalInformation(`${KIXObjectType.CONTACT}-ID`);
        }

        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const contactValue = formInstance.getFormFieldValue<number>(this.state.field.instanceId);

        if (contactId || (contactValue && contactValue.value)) {
            contactId = contactId || Array.isArray(contactValue.value) ? contactValue.value[0] : contactValue.value;
            if (!isNaN(Number(contactId))) {
                const currentNode = await this.getContactNode(Number(contactId));
                if (currentNode) {
                    nodes.push(currentNode);
                    currentNode.selected = true;
                }
            } else {
                const currentNode = new TreeNode(contactId, contactId.toString(), 'kix-icon-man-bubble');
                currentNode.selected = true;
                nodes = [currentNode];
            }
        }

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.setTree(nodes);
        }
    }

    public async nodesChanged(nodes: TreeNode[]): Promise<void> {
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        let contactId = currentNode ? currentNode.id : null;
        if (contactId) {
            if (isNaN(contactId)) {
                contactId = await this.handleUnknownContactId(contactId);
            }
        }
        super.provideValue(contactId);
    }

    private async getContactNode(contactId: number): Promise<TreeNode> {
        const contacts = await KIXObjectService.loadObjects(KIXObjectType.CONTACT, [contactId]);
        if (contacts && contacts.length) {
            const contact = contacts[0];
            const node = await this.createTreeNode(contact);
            return node;
        }

        return null;
    }

    private async searchContacts(limit: number, searchValue: string): Promise<TreeNode[]> {
        const nodes = [];
        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.CONTACT);
        if (service) {
            const filter = await service.prepareFullTextFilter(searchValue);
            const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
            this.contacts = await KIXObjectService.loadObjects(
                KIXObjectType.CONTACT, null, loadingOptions, null, true
            );

            if (searchValue && searchValue !== '') {
                for (const c of this.contacts) {
                    const node = await this.createTreeNode(c);
                    nodes.push(node);
                }
            }
        }

        return nodes;
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    private async handleUnknownContactId(contactId: number | string): Promise<string | number> {
        if (FormValidationService.getInstance().isValidEmail(contactId.toString())) {
            const loadingOptions = new KIXObjectLoadingOptions([
                new FilterCriteria(
                    'Email', SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, contactId
                )
            ]);
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null, loadingOptions
            );
            if (contacts && contacts.length) {
                contactId = contacts[0].ID;
            }
        } else {
            contactId = null;
        }

        return contactId;
    }

    private async createTreeNode(contact: KIXObject): Promise<TreeNode> {
        const displayValue = await LabelService.getInstance().getObjectText(contact);
        return new TreeNode(contact.ObjectId, displayValue, 'kix-icon-man-bubble');
    }
}

module.exports = Component;
