import { IMainMenuExtension } from '../../core/extensions';
import { AdminContext } from '../../core/browser/admin';
import {
    TicketTypeDetailsContext, TicketStateDetailsContext, TicketPriorityDetailsContext
} from '../../core/browser/ticket';
import { ConfigItemClassDetailsContext } from '../../core/browser/cmdb';
import { TranslationDetailsContext } from '../../core/browser/i18n/admin/context';
import { RoleDetailsContext, UserDetailsContext } from '../../core/browser/user';
import { QueueDetailsContext } from '../../core/browser/ticket/admin/context/ticket-queue';
import { SystemAddressDetailsContext } from '../../core/browser/system-address';
import { FAQCategoryDetailsContext } from '../../core/browser/faq/admin';
import { MailAccountDetailsContext } from '../../core/browser/mail-account';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = AdminContext.CONTEXT_ID;

    public contextIds: string[] = [
        AdminContext.CONTEXT_ID,
        TicketTypeDetailsContext.CONTEXT_ID,
        TicketStateDetailsContext.CONTEXT_ID,
        TicketPriorityDetailsContext.CONTEXT_ID,
        ConfigItemClassDetailsContext.CONTEXT_ID,
        TranslationDetailsContext.CONTEXT_ID,
        TicketTypeDetailsContext.CONTEXT_ID,
        TicketPriorityDetailsContext.CONTEXT_ID,
        TicketStateDetailsContext.CONTEXT_ID,
        ConfigItemClassDetailsContext.CONTEXT_ID,
        RoleDetailsContext.CONTEXT_ID,
        UserDetailsContext.CONTEXT_ID,
        QueueDetailsContext.CONTEXT_ID,
        SystemAddressDetailsContext.CONTEXT_ID,
        FAQCategoryDetailsContext.CONTEXT_ID,
        MailAccountDetailsContext.CONTEXT_ID
    ];

    public primaryMenu: boolean = false;

    public icon: string = "kix-icon-admin";

    public text: string = "Translatable#Admin";



}

module.exports = (data, host, options) => {
    return new Extension();
};
