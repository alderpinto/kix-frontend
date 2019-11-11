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
    KIXObjectType, FormContext, FormFieldValue, RoleProperty, FormFieldOption, ObjectReferenceOptions,
    KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType, ContextConfiguration, KIXObjectProperty,
    ContextMode, ConfiguredDialogWidget, WidgetConfiguration
} from '../../core/model';
import {
    FormGroupConfiguration, FormFieldConfiguration, FormConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationService } from '../../core/services';
import { NewUserRoleDialogContext } from '../../core/browser/user';
import { SearchOperator } from '../../core/browser';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewUserRoleDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {
        const widget = new WidgetConfiguration(
            'user-role-new-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'new-user-role-dialog', 'Translatable#New Role', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(widget);

        return new ContextConfiguration(
            this.getModuleId(), 'New User Role Dialog', ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'user-role-new-dialog-widget', 'user-role-new-dialog-widget',
                    KIXObjectType.ROLE, ContextMode.CREATE_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'user-new-role-form';
        const nameField = new FormFieldConfiguration(
            'user-role-new-form-field-name',
            'Translatable#Name', RoleProperty.NAME, null, true,
            'Translatable#Helptext_Admin_Users_RoleCreate_Name'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(nameField);

        const commentField = new FormFieldConfiguration(
            'user-role-new-form-field-comment',
            'Translatable#Comment', RoleProperty.COMMENT, 'text-area-input', false,
            'Translatable#Helptext_Admin_Users_RoleCreate_Comment',
            null, null, null, null, null, null, null, null, 250
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(commentField);

        const validField = new FormFieldConfiguration(
            'user-role-new-form-field-validity',
            'Translatable#Validity', KIXObjectProperty.VALID_ID,
            'object-reference-input', true, 'Translatable#Helptext_Admin_Users_RoleCreate_Valid',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(validField);

        const infoGroup = new FormGroupConfiguration(
            'user-role-new-form-group-role-information', 'Translatable#Role Information',
            [
                'user-role-new-form-field-name',
                'user-role-new-form-field-comment',
                'user-role-new-form-field-validity'
            ]
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(infoGroup);

        const permissionField = new FormFieldConfiguration(
            'user-role-new-form-field-permissions',
            null, RoleProperty.PERMISSIONS, 'permissions-form-input', false, null
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(permissionField);

        const permissionGroup = new FormGroupConfiguration(
            'user-role-new-form-group-permissions', 'Translatable#Permissions',
            [
                'user-role-new-form-field-permissions'
            ]
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(permissionGroup);

        const agentsField = new FormFieldConfiguration(
            'user-role-new-form-field-agents',
            'Translatable#Agents', RoleProperty.USER_IDS, 'object-reference-input', false,
            'Translatable#Helptext_Admin_Users_RoleCreate_User',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),

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
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(agentsField);

        const agentsGroup = new FormGroupConfiguration(
            'user-role-new-form-group-agents', 'Translatable#Agent Assignment',
            [
                'user-role-new-form-field-agents'
            ]
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(agentsGroup);

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'user-role-new-form-group-page', 'Translatable#New Role',
                [
                    'user-role-new-form-group-role-information',
                    'user-role-new-form-group-permissions',
                    'user-role-new-form-group-agents'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#New Role',
                ['user-role-new-form-group-page'],
                KIXObjectType.ROLE
            )
        );
        configurationService.registerForm([FormContext.NEW], KIXObjectType.ROLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
