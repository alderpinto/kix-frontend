import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'ticket', 'Translatable#Ticket', null, [], [
                    new AdminModule(
                        null, 'ticket-types', 'Translatable#Types', null,
                        KIXObjectType.TICKET_TYPE, 'ticket-admin-types'
                    ),
                    new AdminModule(
                        null, 'ticket-priorities', 'Translatable#Priorities', null,
                        KIXObjectType.TICKET_PRIORITY, 'ticket-admin-priorities'
                    ),
                    new AdminModule(
                        null, 'ticket-states', 'Translatable#States', null,
                        KIXObjectType.TICKET_STATE, 'ticket-admin-states'
                    ),
                    new AdminModule(
                        null, 'ticket-templates', 'Translatable#Templates', null,
                        KIXObjectType.TICKET_TEMPLATE, 'ticket-admin-templates'
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
