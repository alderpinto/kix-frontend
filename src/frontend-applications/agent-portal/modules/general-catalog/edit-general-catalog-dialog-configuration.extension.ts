/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from "../../server/extensions/IConfigurationExtension";
import { EditGeneralCatalogDialogContext } from "./webapp/core";
import { IConfiguration } from "../../model/configuration/IConfiguration";
import { WidgetConfiguration } from "../../model/configuration/WidgetConfiguration";
import { ConfigurationType } from "../../model/configuration/ConfigurationType";
import { ContextConfiguration } from "../../model/configuration/ContextConfiguration";
import { ConfiguredDialogWidget } from "../../model/configuration/ConfiguredDialogWidget";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { ContextMode } from "../../model/ContextMode";
import { FormFieldConfiguration } from "../../model/configuration/FormFieldConfiguration";
import { GeneralCatalogItemProperty } from "./model/GeneralCatalogItemProperty";
import { FormFieldOption } from "../../model/configuration/FormFieldOption";
import { ObjectReferenceOptions } from "../../modules/base-components/webapp/core/ObjectReferenceOptions";
import { KIXObjectLoadingOptions } from "../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../model/FilterCriteria";
import { KIXObjectProperty } from "../../model/kix/KIXObjectProperty";
import { SearchOperator } from "../search/model/SearchOperator";
import { FilterDataType } from "../../model/FilterDataType";
import { FilterType } from "../../model/FilterType";
import { FormGroupConfiguration } from "../../model/configuration/FormGroupConfiguration";
import { FormPageConfiguration } from "../../model/configuration/FormPageConfiguration";
import { FormConfiguration } from "../../model/configuration/FormConfiguration";
import { FormContext } from "../../model/configuration/FormContext";
import { ConfigurationService } from "../../../../server/services/ConfigurationService";
import { ModuleConfigurationService } from "../../server/services/configuration";

import { KIXExtension } from "../../../../server/model/KIXExtension";

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditGeneralCatalogDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'general-catalog-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'edit-general-catalog-dialog', 'Translatable#Edit Value', [],
            null, null, false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'general-catalog-edit-dialog-widget', 'general-catalog-edit-dialog-widget',
                        KIXObjectType.GENERAL_CATALOG_ITEM, ContextMode.EDIT_ADMIN
                    )
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'general-catalog-edit-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-edit-form-field-class',
                'Translatable#Class', GeneralCatalogItemProperty.CLASS, 'object-reference-input', true,
                'Translatable#Helptext_Admin_GeneralCatalogCreate_Class', [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.GENERAL_CATALOG_CLASS),

                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                            FilterType.AND, 1
                        )
                    ])
                ),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false)
            ], null, null,
                null, null, null, null, null, 100
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-edit-form-field-name',
                'Translatable#Name', GeneralCatalogItemProperty.NAME, null, true,
                'Translatable#Helptext_Admin_GeneralCatalogCreate_Name', null, null, null,
                null, null, null, null, null, 100
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-edit-form-field-icon',
                'Translatable#Icon', 'ICON', 'icon-input', false,
                'Translatable#Helptext_Admin_Tickets_GeneralCatalogCreate_Icon.'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-edit-form-field-comment',
                'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_Admin_GeneralCatalogCreate_Comment', null, null, null,
                null, null, null, null, null, 250
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'general-catalog-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_GeneralCatalogCreate_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ]
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'general-catalog-edit-form-group-information', 'Translatable#General Catalog',
                [
                    'general-catalog-edit-form-field-class',
                    'general-catalog-edit-form-field-name',
                    'general-catalog-edit-form-field-icon',
                    'general-catalog-edit-form-field-comment',
                    'general-catalog-edit-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'general-catalog-edit-form-page', 'Translatable#Edit Value',
                ['general-catalog-edit-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Value',
                ['general-catalog-edit-form-page'],
                KIXObjectType.GENERAL_CATALOG_ITEM, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.EDIT], KIXObjectType.GENERAL_CATALOG_ITEM, formId
        );

        return configurations;
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
