/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractNewDialog } from '../../../../../modules/base-components/webapp/core/AbstractNewDialog';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TicketDetailsContext, NewTicketArticleContext } from '../../core';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { TabContainerEvent } from '../../../../../modules/base-components/webapp/core/TabContainerEvent';
import { TabContainerEventData } from '../../../../../modules/base-components/webapp/core/TabContainerEventData';
import { CreateTicketArticleOptions } from '../../../model/CreateTicketArticleOptions';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { Ticket } from '../../../model/Ticket';
import { TicketProperty } from '../../../model/TicketProperty';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';

class Component extends AbstractNewDialog {

    private formSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Article',
            'Translatable#Article successfully created.',
            KIXObjectType.ARTICLE,
            null
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
        const dialogContext = await ContextService.getInstance().getContext(NewTicketArticleContext.CONTEXT_ID);
        if (dialogContext) {
            const tabTitle = dialogContext.getAdditionalInformation('NEW_ARTICLE_TAB_TITLE');
            if (tabTitle) {
                EventService.getInstance().publish(
                    TabContainerEvent.CHANGE_TITLE, new TabContainerEventData(
                        'ticket-article-new-dialog-widget', tabTitle)
                );
            }

            const tabIcon = dialogContext.getAdditionalInformation('NEW_ARTICLE_TAB_ICON');
            if (tabIcon) {
                EventService.getInstance().publish(
                    TabContainerEvent.CHANGE_ICON,
                    new TabContainerEventData('ticket-article-new-dialog-widget', null, tabIcon)
                );
            }
        }
        this.options = new CreateTicketArticleOptions(
            Number(context.getObjectId())
        );

        this.formSubscriber = {
            eventSubscriberId: 'NewTicketArticleDialog',
            eventPublished: (data: FormValuesChangedEventData, eventId: string) => {
                const channelValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === ArticleProperty.CHANNEL_ID
                );

                if (channelValue && channelValue[1]) {
                    const channelId = channelValue[1].value;
                    if (channelId === 2) {
                        this.state.buttonLabel = 'Translatable#Send';
                    } else {
                        this.state.buttonLabel = 'Translatable#Save';
                    }
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
        const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
        const ticket = await context.getObject<Ticket>(KIXObjectType.TICKET, true, [TicketProperty.ARTICLES]);
        const article = ticket.Articles.sort((a, b) => b.ArticleID - a.ArticleID)[0];
        if (article.isUnsent()) {
            BrowserUtil.openErrorOverlay(article.getUnsentError());
        }
    }

}

module.exports = Component;
