/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FAQCategoryLabelProvider } from "../../../../core";
import { FAQCategoryDetailsContext } from "../../../../core/admin";
import {
    AbstractMarkoComponent
} from '../../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../../../modules/base-components/webapp/core/ContextService';
import { FAQCategory } from '../../../../../model/FAQCategory';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../../../modules/base-components/webapp/core/ActionFactory';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new FAQCategoryLabelProvider();
        const context = await ContextService.getInstance().getContext<FAQCategoryDetailsContext>(
            FAQCategoryDetailsContext.CONTEXT_ID
        );
        context.registerListener('faq-category-info-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (categoryId: string, faqCategory: FAQCategory, type: KIXObjectType | string) => {
                if (type === KIXObjectType.FAQ_CATEGORY) {
                    this.initWidget(faqCategory);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.initWidget(await context.getObject<FAQCategory>());
    }

    private async initWidget(faqCategory: FAQCategory): Promise<void> {
        this.state.faqCategory = faqCategory;
        this.prepareActions();
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.faqCategory) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.faqCategory]
            );
        }
    }

}

module.exports = Component;
