/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import {
    ConfiguredWidget, FormField, KIXObjectType, Form,
    FormContext, FormFieldValue, RoleProperty, FormFieldOption, ObjectReferenceOptions, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType, ContextConfiguration, KIXObjectProperty
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { NewUserRoleDialogContext } from '../../core/browser/user';
import { SearchOperator } from '../../core/browser';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewUserRoleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-user-role-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing || overwrite) {
            const infoGroup = new FormGroup('Translatable#Role Information', [
                new FormField(
                    'Translatable#Name', RoleProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_Users_RoleCreate_Name'
                ),
                new FormField(
                    'Translatable#Comment', RoleProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_Users_RoleCreate_Comment',
                    null, null, null, null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', RoleProperty.VALID_ID, 'valid-input', true,
                    "Translatable#Helptext_Admin_Users_RoleCreate_Valid",
                    null, new FormFieldValue(1)
                )
            ]);

            const permissionGroup = new FormGroup('Translatable#Permissions', [
                new FormField(
                    null, RoleProperty.PERMISSIONS, 'permissions-form-input', false, null
                )
            ]);

            const agentGroup = new FormGroup('Translatable#Agent Assignment', [
                new FormField(
                    'Translatable#Agents', RoleProperty.USER_IDS, 'object-reference-input', false,
                    'Translatable#Helptext_Admin_Users_RoleCreate_User', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                        new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                        new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                        new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                            new KIXObjectLoadingOptions(
                                [
                                    new FilterCriteria(
                                        KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                        FilterType.AND, 1
                                    )
                                ]
                            )
                        )
                    ]
                )
            ]);

            const form = new Form(
                formId, 'Translatable#New Role', [
                    infoGroup,
                    permissionGroup,
                    agentGroup
                ], KIXObjectType.ROLE
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.ROLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
