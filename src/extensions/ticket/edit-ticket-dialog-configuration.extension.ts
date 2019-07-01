import { IConfigurationExtension } from '../../core/extensions';
import { EditTicketDialogContext, PendingTimeFormValue } from '../../core/browser/ticket';
import {
    ContextConfiguration, FormField, TicketProperty, ArticleProperty,
    Form, KIXObjectType, FormContext, ConfiguredWidget, WidgetConfiguration,
    FormFieldOption, WidgetSize, ObjectReferenceOptions, KIXObjectLoadingOptions,
    FilterCriteria, UserProperty, FilterDataType, FilterType, ObjectinformationWidgetSettings,
    OrganisationProperty, ContactProperty, CRUD
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { SearchOperator } from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class EditTicketDialogModuleExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTicketDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const organisationInfoSidebar =
            new ConfiguredWidget('20180524110915',
                new WidgetConfiguration(
                    'object-information-widget', 'Translatable#Organisation', [],
                    new ObjectinformationWidgetSettings(KIXObjectType.ORGANISATION, [
                        OrganisationProperty.NUMBER,
                        OrganisationProperty.NAME,
                        OrganisationProperty.URL,
                        OrganisationProperty.STREET,
                        OrganisationProperty.ZIP,
                        OrganisationProperty.CITY,
                        OrganisationProperty.COUNTRY
                    ], true),
                    false, false, 'kix-icon-man-house', false
                ),
                [new UIComponentPermission('organisations', [CRUD.READ])]
            );
        const contactInfoSidebar =
            new ConfiguredWidget('20180524110920',
                new WidgetConfiguration(
                    'object-information-widget', 'Translatable#Contact', [],
                    new ObjectinformationWidgetSettings(KIXObjectType.CONTACT, [
                        ContactProperty.LOGIN,
                        ContactProperty.TITLE,
                        ContactProperty.LAST_NAME,
                        ContactProperty.FIRST_NAME,
                        ContactProperty.PRIMARY_ORGANISATION_ID,
                        ContactProperty.PHONE,
                        ContactProperty.MOBILE,
                        ContactProperty.EMAIL
                    ], true),
                    false, false, 'kix-icon-man-bubble', false
                ),
                [new UIComponentPermission('contacts', [CRUD.READ])]
            );

        const helpWidget = new ConfiguredWidget('20180919-help-widget',
            new WidgetConfiguration(
                'help-widget', 'Text Modules', [], {
                    // tslint:disable-next-line:max-line-length
                    helpText: 'Translatable#Helptext_Textmodules_TicketEdit'
                }, false, false, 'kix-icon-textblocks'
            ),
            [new UIComponentPermission('system/textmodules', [CRUD.READ])]
        );

        const sidebars = ['20180524110915', '20180524110920', '20180919-help-widget'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [organisationInfoSidebar, contactInfoSidebar, helpWidget];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formIdEditTicket = 'edit-ticket-form';
        const existingFormEditTicket = configurationService.getModuleConfiguration(formIdEditTicket, null);
        if (!existingFormEditTicket) {
            const fields: FormField[] = [];
            fields.push(new FormField('Translatable#Title', TicketProperty.TITLE, null, true, 'Translatable#Insert a ticket title.'));
            fields.push(new FormField(
                'Translatable#Contact', TicketProperty.CONTACT_ID, 'ticket-input-contact', true, 'Translatable#A contact is a person, filing a request for the customer. Enter at least 3 characters in order to get a suggestion list of already registered contacts. You may use „*“ as wildcard.'
            ));
            fields.push(new FormField('Translatable#Organisation', TicketProperty.ORGANISATION_ID, 'ticket-input-organisation', true, 'Translatable#Choose a contact, customers will be assigned automatically.'));
            fields.push(new FormField('Translatable#Type', TicketProperty.TYPE_ID, 'ticket-input-type', true, 'Translatable#Ticket type is part of the classification of a ticket.'));
            fields.push(new FormField(
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'ticket-input-queue', true, 'Translatable#A queue is a classification system for requests, comparable to folders in a file system.'
            ));
            fields.push(new FormField(
                'Translatable#Affected Service', TicketProperty.SERVICE_ID, 'ticket-input-service', false, 'Translatable#Service defines which content of the service catalog is being requested.'
            ));
            fields.push(new FormField('Translatable#SLA / Service Level Agreement', TicketProperty.SLA_ID, 'ticket-input-sla', false, 'Translatable#SLA defines which target times are set for processing this ticket.'));

            fields.push(new FormField(
                'Translatable#Channel', ArticleProperty.CHANNEL_ID, 'channel-input', false, 'Translatable#Channel', [
                    new FormFieldOption('NO_CHANNEL', true),
                ])
            );

            fields.push(new FormField(
                'Translatable#Owner', TicketProperty.OWNER_ID, 'object-reference-input', false,
                'Translatable#Owner is the user to which the ticket is assigned for processing.', [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    UserProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            ));
            fields.push(new FormField(
                'Translatable#Responsible', TicketProperty.RESPONSIBLE_ID, 'object-reference-input', false,
                'Translatable#Responsible is the person in charge for this tickets processing, e.g. Service Owner, Key Account Manager. It does not need to be identical with the assigned ticket owner.', [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    UserProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            ));
            fields.push(new FormField<number>(
                'Translatable#Priority', TicketProperty.PRIORITY_ID, 'ticket-input-priority', true,
                'Translatable#Priorities are used to mark a Ticket‘s urgency with different colours, so you can  categorize Tickets.'
            ));
            fields.push(new FormField<PendingTimeFormValue>(
                'Translatable#State', TicketProperty.STATE_ID, 'ticket-input-state', true,
                'Translatable#Ticket status summarizes the tickets processing state.'
            ));

            const group = new FormGroup('Translatable#Ticket Data', fields);

            const form = new Form(
                formIdEditTicket, 'Translatable#Edit Ticket', [group],
                KIXObjectType.TICKET, true, FormContext.EDIT);
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.TICKET, formIdEditTicket);
    }

}

module.exports = (data, host, options) => {
    return new EditTicketDialogModuleExtension();
};