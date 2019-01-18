import {
    AttributeDefinition, FormField, FormFieldOption, KIXObjectType, FormFieldOptions,
    InputFieldTypes, Form, VersionProperty, ConfigItemProperty, ConfigItemClass, FormContext, ObjectReferenceOptions
} from "../../model";
import { isArray } from "util";
import { FormGroup } from "../../model/components/form/FormGroup";

export class ConfigItemFormFactory {

    private static INSTANCE: ConfigItemFormFactory;

    public static getInstance(): ConfigItemFormFactory {
        if (!ConfigItemFormFactory.INSTANCE) {
            ConfigItemFormFactory.INSTANCE = new ConfigItemFormFactory();
        }
        return ConfigItemFormFactory.INSTANCE;
    }

    private constructor() { }

    public getFormId(ciClass: ConfigItemClass, edit: boolean = false): string {
        const editString = edit ? '_EDIT' : '';
        return ciClass.CurrentDefinition
            ? `CMDB_CI_${ciClass.Name}_${ciClass.ID}_${ciClass.CurrentDefinition.Version}${editString}`
            : null;
    }

    // tslint:disable:max-line-length
    public async createCIForm(ciClass: ConfigItemClass, formId: string, forEdit: boolean = false): Promise<Form> {
        const fields: FormField[] = [];

        if (forEdit) {
            fields.push(new FormField(
                'Config Item Klasse', VersionProperty.CLASS_ID, null, false, 'Klasse des Config Items. Nicht änderbar',
                null, null, null, null, 1, 1, 1,
                null, null, null, false, false, true
            ));
        }
        fields.push(new FormField(
            'Name', VersionProperty.NAME, null, true, 'Geben Sie einen Namen für das Config Item ein.',
            null, null, null, null, 1, 1, 1,
            null, null, null, false, false
        ));
        fields.push(new FormField(
            'Verwendungsstatus', VersionProperty.DEPL_STATE_ID, 'general-catalog-input',
            true, 'Wählen Sie einen Verwendungsstatus aus der Liste.',
            [
                new FormFieldOption('GC_CLASS', 'ITSM::ConfigItem::DeploymentState'),
                new FormFieldOption('ICON', false)
            ],
            null, null, null, 1, 1, 1, null, null, null, false, false
        ));
        fields.push(new FormField(
            'Vorfallstatus', VersionProperty.INCI_STATE_ID, 'general-catalog-input',
            true, 'Wählen Sie einen Vorfallstatus aus der Liste.',
            [
                new FormFieldOption('GC_CLASS', 'ITSM::Core::IncidentState'),
                new FormFieldOption('ICON', true)
            ],
            null, null, null, 1, 1, 1, null, null, null, false, false
        ));

        if (!forEdit) {
            fields.push(new FormField(
                'Bilder', ConfigItemProperty.IMAGES, 'attachment-input', false, 'Möglichkeit der Anlage von Bilddateien für das Config Item. Erlaubte Dateiformate sind: *.png, *.jpg, *.gif, *.bmp.',
                [new FormFieldOption('MimeTypes', ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'])],
                null, null, null, 1, 1, 1, null, null, null, false, false
            ));
            fields.push(new FormField(
                'CI Verknüpfen mit', ConfigItemProperty.LINKS, 'link-input', false, 'Verknüpfen Sie das Config Item mit einem Ticket, einem FAQ-Artikel oder einem anderen Config Item.',
                null, null, null, null, 1, 1, 1, null, null, null, false, false
            ));
        }

        if (ciClass.CurrentDefinition && ciClass.CurrentDefinition.Definition) {
            for (const ad of ciClass.CurrentDefinition.Definition) {
                const field = await this.getFormField(ad);
                fields.push(field);
            }
        }

        const mainGroup = new FormGroup('Config Item Daten', fields);

        const form = new Form(
            formId,
            forEdit ? 'Config Item bearbeiten' : 'Neues Config Item',
            [mainGroup], KIXObjectType.CONFIG_ITEM, true,
            forEdit ? FormContext.EDIT : null
        );

        return form;
    }

    private getFormField(ad: AttributeDefinition, parentInstanceId?: string): FormField {
        let formField: FormField;
        if (ad.Input.Type === 'GeneralCatalog') {
            formField = this.getGeneralCatalogField(ad, parentInstanceId);
        } else if (ad.Input.Type === 'Text') {
            formField = this.getTextField(ad, parentInstanceId);
        } else if (ad.Input.Type === 'TextArea') {
            formField = this.getTextAreaField(ad, parentInstanceId);
        } else if (ad.Input.Type === 'Contact') {
            formField = this.getObjectReferenceField(ad, parentInstanceId, KIXObjectType.CONTACT);
        } else if (ad.Input.Type === 'Customer') {
            formField = this.getObjectReferenceField(ad, parentInstanceId, KIXObjectType.CUSTOMER);
        } else if (ad.Input.Type === 'CIClassReference') {
            formField = this.getCIClassReferenceField(ad, parentInstanceId);
        } else if (ad.Input.Type === 'Date') {
            formField = this.getDateField(ad, parentInstanceId);
        } else if (ad.Input.Type === 'DateTime') {
            formField = this.getDateTimeField(ad, parentInstanceId);
        } else if (ad.Input.Type === 'Attachment') {
            formField = this.getAttachmentFormField(ad, parentInstanceId);
        } else if (ad.Input.Type === 'Dummy') {
            formField = this.getDefaultFormField(ad, parentInstanceId, true);
            formField.empty = true;
            formField.asStructure = true;
        } else {
            formField = this.getDefaultFormField(ad, parentInstanceId);
        }

        if (formField.countDefault === 0) {
            formField.empty = true;
        }

        if (ad.Sub) {
            formField.children = ad.Sub.map((subField) => this.getFormField(subField, formField.instanceId));
        }

        return formField;
    }

    private getGeneralCatalogField(ad: AttributeDefinition, parentInstanceId?: string): FormField {
        return new FormField(ad.Name, ad.Key, 'general-catalog-input', ad.Input.Required, null,
            [
                new FormFieldOption('GC_CLASS', ad.Input['Class']),
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.GENERAL_CATALOG)
            ], null, null, parentInstanceId, ad.CountDefault ? ad.CountDefault : 1, ad.CountMax,
            ad.CountMin, ad.Input.MaxLength,
            ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getTextField(ad: AttributeDefinition, parentInstanceId: string): FormField {
        return new FormField(ad.Name, ad.Key, null, ad.Input.Required, null,
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.TEXT)
            ], null, null, parentInstanceId, ad.CountDefault ? ad.CountDefault : 1, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getTextAreaField(ad: AttributeDefinition, parentInstanceId: string): FormField {
        return new FormField(ad.Name, ad.Key, 'text-area-input', ad.Input.Required, null,
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.TEXT_AREA)
            ], null, null, parentInstanceId, ad.CountDefault ? ad.CountDefault : 1, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getObjectReferenceField(
        ad: AttributeDefinition, parentInstanceId: string, objectType: KIXObjectType
    ): FormField {
        return new FormField(ad.Name, ad.Key, 'object-reference-input', ad.Input.Required, null,
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, objectType),
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.OBJECT_REFERENCE)
            ], null, null, parentInstanceId, ad.CountDefault ? ad.CountDefault : 1, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getCIClassReferenceField(ad: AttributeDefinition, parentInstanceId: string): FormField {
        let classes = [];
        if (isArray(ad.Input['ReferencedCIClassName'])) {
            classes = ad.Input['ReferencedCIClassName'];
        } else {
            classes = [ad.Input['ReferencedCIClassName']];
        }
        return new FormField(ad.Name, ad.Key, 'ci-class-reference-input', ad.Input.Required, null,
            [
                new FormFieldOption('CI_CLASS', classes),
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.CI_REFERENCE)
            ], null, null, parentInstanceId, ad.CountDefault ? ad.CountDefault : 1, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getDateField(ad: AttributeDefinition, parentInstanceId: string): FormField {
        return new FormField(ad.Name, ad.Key, 'date-time-input', ad.Input.Required, null,
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.DATE),
            ],
            null, null, parentInstanceId, ad.CountDefault ? ad.CountDefault : 1, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength,
            ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getDateTimeField(ad: AttributeDefinition, parentInstanceId: string): FormField {
        return new FormField(ad.Name, ad.Key, 'date-time-input', ad.Input.Required, null,
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.DATE_TIME)
            ], null, null, parentInstanceId, ad.CountDefault ? ad.CountDefault : 1, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getDefaultFormField(ad: AttributeDefinition, parentInstanceId: string, dummy: boolean = false): FormField {
        return new FormField(ad.Name, ad.Key, null, ad.Input.Required, null,
            [
                new FormFieldOption(
                    FormFieldOptions.INPUT_FIELD_TYPE, dummy ? InputFieldTypes.DUMMY : InputFieldTypes.TEXT
                )
            ], null, null, parentInstanceId, ad.CountDefault ? ad.CountDefault : 1, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }

    private getAttachmentFormField(ad: AttributeDefinition, parentInstanceId: string): FormField {
        return new FormField(ad.Name, ad.Key, 'attachment-input', ad.Input.Required, null,
            [
                new FormFieldOption('MULTI_FILES', false),
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.ATTACHMENT)
            ], null, null, parentInstanceId, ad.CountDefault ? ad.CountDefault : 1, ad.CountMax, ad.CountMin,
            ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
        );
    }
}
