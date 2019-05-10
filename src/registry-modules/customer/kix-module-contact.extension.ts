import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

    public initComponentIds: string = 'contact-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['contact-module-component', 'customer/contact-module-component'],
        ['contact-module-component', 'customer/contact-module-component'],
        ['contact-info-widget', 'customer/widgets/contact-info-widget'],
        ['contact-assigned-customers-widget', 'customer/widgets/contact-assigned-customers-widget'],
        ['contact-assigned-tickets-widget', 'customer/widgets/contact-assigned-tickets-widget'],
        ['new-contact-dialog', 'customer/dialogs/new-contact-dialog'],
        ['edit-contact-dialog', 'customer/dialogs/edit-contact-dialog'],
        ['search-contact-dialog', 'customer/dialogs/search-contact-dialog'],
        ['contact-input-customer', 'customer/dialogs/inputs/contact-input-customer'],
        ['create-new-ticket-cell', 'customer/table/create-new-ticket-cell']
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
