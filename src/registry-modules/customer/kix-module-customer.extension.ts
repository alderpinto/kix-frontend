import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

    public initComponentId: string = 'customer-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['customer-module-component', 'customer/customer-module-component'],
        ['customer-module-component', 'customer/customer-module-component'],
        ['customers', 'customer/customer-module'],
        ['customer-info-widget', 'customer/widgets/customer-info-widget'],
        ['customer-assigned-contacts-widget', 'customer/widgets/customer-assigned-contacts-widget'],
        ['customer-assigned-tickets-widget', 'customer/widgets/customer-assigned-tickets-widget'],
        ['new-customer-dialog', 'customer/dialogs/new-customer-dialog'],
        ['edit-customer-dialog', 'customer/dialogs/edit-customer-dialog'],
        ['search-customer-dialog', 'customer/dialogs/search-customer-dialog']
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
