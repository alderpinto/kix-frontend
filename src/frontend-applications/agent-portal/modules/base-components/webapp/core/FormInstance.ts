/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { ServiceRegistry } from './ServiceRegistry';
import { ServiceType } from './ServiceType';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormValidationService } from './FormValidationService';
import { ValidationSeverity } from './ValidationSeverity';
import { ValidationResult } from './ValidationResult';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DynamicFormFieldOption } from '../../../dynamic-fields/webapp/core/DynamicFormFieldOption';
import { IdService } from '../../../../model/IdService';
import { FormService } from './FormService';
import { EventService } from './EventService';
import { FormEvent } from './FormEvent';
import { FormValuesChangedEventData } from './FormValuesChangedEventData';
import { FormFactory } from './FormFactory';
import { KIXObjectFormService } from './KIXObjectFormService';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class FormInstance {

    private formFieldValues: Map<string, FormFieldValue<any>> = new Map();
    private fixedValues: Map<string, FormFieldValue<any>> = new Map();

    private templateValues: Map<string, [FormFieldConfiguration, FormFieldValue<any>]> = new Map();
    private savedValues: Map<string, [FormFieldConfiguration, FormFieldValue<any>]> = null;

    private form: FormConfiguration;

    public provideFixedValue(property: string, value: FormFieldValue): void {
        this.fixedValues.set(property, value);
        EventService.getInstance().publish(
            FormEvent.FIXED_VALUE_CHANGED, { formInstance: this, property, value }
        );
    }

    public getFixedValues(): Map<string, FormFieldValue> {
        return this.fixedValues;
    }

    public getTemplateValues(): Map<string, [FormFieldConfiguration, FormFieldValue<any>]> {
        return this.templateValues;
    }

    public provideTemplateValue(property: string, value: [FormFieldConfiguration, FormFieldValue]): void {
        this.templateValues.set(property, value);
    }

    public async initFormInstance(formId: string, kixObject: KIXObject): Promise<void> {
        this.form = await FormService.getInstance().getForm(formId);
        FormFactory.initForm(this.form);
        await this.initFormFields(kixObject);
    }

    private async initFormFields(kixObject: KIXObject): Promise<void> {
        if (this.form) {
            const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                await service.initValues(this.form, this, kixObject);
            } else {
                this.form.pages.forEach(
                    (p) => p.groups.forEach((g) => this.setDefaultValueAndParent(g.formFields))
                );
            }
        }
    }

    private setDefaultValueAndParent(formFields: FormFieldConfiguration[], parent?: FormFieldConfiguration): void {
        formFields.forEach((f) => {
            f.parent = parent;

            if (!f.instanceId) {
                f.instanceId = IdService.generateDateBasedId(f.property);
            }

            if (this.templateValues.has(f.property)) {
                const value = this.templateValues.get(f.property);
                if (Array.isArray(value)) {
                    this.formFieldValues.set(f.instanceId, value[1]);
                    f.visible = value[0].visible;
                    f.readonly = value[0].readonly;
                }
            } else {
                this.formFieldValues.set(f.instanceId, f.defaultValue
                    ? new FormFieldValue(f.defaultValue.value, f.defaultValue.valid)
                    : new FormFieldValue(null)
                );
            }

            if (f.children) {
                this.setDefaultValueAndParent(f.children, f);
            }
        });
    }

    public getForm(): FormConfiguration {
        return this.form;
    }

    public hasValues(): boolean {
        const iterator = this.formFieldValues.values();
        let value = iterator.next();
        while (value.value !== null && value.value !== undefined) {
            if (value.value.value !== null && value.value.value !== undefined) {
                return true;
            }
            value = iterator.next();
        }
        return false;
    }

    public async removeFormField(formField: FormFieldConfiguration): Promise<void> {
        let fields: FormFieldConfiguration[];

        if (formField.parent) {
            fields = formField.parent.children;
        } else {
            fields = await this.getFields(formField);
        }

        if (Array.isArray(fields)) {
            const index = fields.findIndex((c) => c.instanceId === formField.instanceId);
            fields.splice(index, 1);
            this.deleteFieldValues(formField);
            const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                await service.updateFields(fields, this);
            }

            EventService.getInstance().publish(FormEvent.FIELD_REMOVED, { formInstance: this, formField });
        }
    }

    public setFieldEmptyState(formField: FormFieldConfiguration, empty: boolean = true): void {
        formField.empty = empty;
        if (empty) {
            this.deleteFieldValues(formField);
            this.setFieldChildrenEmpty(formField);
        }
    }

    private setFieldChildrenEmpty(formField: FormFieldConfiguration): void {
        if (formField.children) {
            const fields = [];
            for (const child of formField.children) {
                const existingFields = fields.filter((c) => c.property === child.property);
                let fieldCount = existingFields.length;

                if (!fieldCount) {
                    fields.push(child);
                    fieldCount++;
                }

                if (isNaN(child.countDefault) || child.countDefault > fieldCount) {
                    if (!isNaN(child.countDefault) && child.countDefault === 0) {
                        child.empty = true;
                    }
                    fields.push(child);
                }

                this.setFieldChildrenEmpty(child);
            }
            formField.children = fields;
        }
    }

    public async removePages(pageIds: string[], protectedPages?: string[]): Promise<void> {
        if (!pageIds) {
            pageIds = this.form.pages.map((p) => p.id);
        }

        if (Array.isArray(pageIds)) {
            const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            for (const pageId of pageIds) {
                if (protectedPages.some((id) => id === pageId)) {
                    continue;
                }

                const index = this.form.pages.findIndex((p) => p.id === pageId);
                if (index !== -1) {
                    const deletedPage = this.form.pages.splice(index, 1);
                    if (deletedPage[0].groups.length) {
                        for (const group of deletedPage[0].groups) {
                            group.formFields.forEach((f) => this.deleteFieldValues(f));
                            if (service) {
                                await service.updateFields(group.formFields, this);
                            }
                        }
                    }
                }
            }

            EventService.getInstance().publish(FormEvent.FORM_PAGES_REMOVED, { formInstance: this, pageIds });
        }
    }

    public async getFields(formField: FormFieldConfiguration): Promise<FormFieldConfiguration[]> {
        let fields: FormFieldConfiguration[];
        if (formField.parent) {
            const parent = await this.getFormField(formField.parent.instanceId);
            fields = parent.children;
        } else {
            for (const page of this.form.pages) {
                for (const group of page.groups) {
                    fields = this.findFormFieldList(group.formFields, formField.instanceId);
                    if (fields) {
                        break;
                    }
                }
                if (fields) {
                    break;
                }
            }
        }
        return fields;
    }

    public async duplicateAndAddNewField(
        formField: FormFieldConfiguration, withChildren: boolean = true
    ): Promise<FormFieldConfiguration> {
        const fields: FormFieldConfiguration[] = await this.getFields(formField);
        if (Array.isArray(fields)) {
            const index = fields.findIndex((c) => c.instanceId === formField.instanceId);
            const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                const newField = service.getNewFormField(formField, null, withChildren);
                fields.splice(index + 1, 0, newField);
                this.setDefaultValueAndParent([newField], formField.parent);
                await service.updateFields(fields, this);

                EventService.getInstance().publish(FormEvent.FIELD_CHILDREN_ADDED, { formInstance: this, parent });
                return newField;
            }
        }
        return null;
    }

    public async addFieldChildren(
        parent: FormFieldConfiguration, children: FormFieldConfiguration[], clearChildren: boolean = false
    ): Promise<void> {
        if (parent) {
            parent = await this.getFormField(parent.instanceId);
            if (!parent.children) {
                parent.children = [];
            }
            if (clearChildren) {
                parent.children.forEach((c) => this.deleteFieldValues(c));
                parent.children = [];
            }
            children.forEach((f) => parent.children.push(f));
            this.setDefaultValueAndParent(children, parent);

            EventService.getInstance().publish(FormEvent.FIELD_CHILDREN_ADDED, { formInstance: this, parent });
        }
    }

    public addPage(page: FormPageConfiguration, index?: number): void {
        if (page) {

            if (page.groups.length) {
                page.groups.forEach((g) => this.setDefaultValueAndParent(g.formFields));
            }

            if (!isNaN(index)) {
                this.form.pages.splice(index, 0, page);
            } else {
                this.form.pages.push(page);
            }

            EventService.getInstance().publish(FormEvent.FORM_PAGE_ADDED, { formInstance: this, page });
        }
    }

    private deleteFieldValues(formField: FormFieldConfiguration): void {
        this.formFieldValues.delete(formField.instanceId);
        if (formField.children) {
            formField.children.forEach((c) => this.deleteFieldValues(c));
        }
    }

    public async provideFormFieldValues<T>(
        values: Array<[string, T]>, originInstanceId: string, silent?: boolean
    ): Promise<void> {
        const changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]> = [];
        for (const newValue of values) {
            const instanceId = newValue[0];
            const value = newValue[1];
            if (!this.formFieldValues.has(instanceId)) {
                this.formFieldValues.set(instanceId, new FormFieldValue(value));
            }

            const formFieldValue = this.formFieldValues.get(instanceId);
            formFieldValue.value = value;

            const formField = await this.getFormField(instanceId);
            if (this.form.validation) {
                const result = await FormValidationService.getInstance().validate(formField, this.form.id);
                formFieldValue.valid = result.findIndex((vr) => vr.severity === ValidationSeverity.ERROR) === -1;
            }
            changedFieldValues.push([formField, formFieldValue]);
        }

        if (!silent) {
            EventService.getInstance().publish(
                FormEvent.VALUES_CHANGED, new FormValuesChangedEventData(this, changedFieldValues, originInstanceId)
            );

            const valueHandler = FormService.getInstance().getFormFieldValueHandler(this.form.objectType);
            if (valueHandler) {
                for (const handler of valueHandler) {
                    handler.handleFormFieldValues(this, changedFieldValues);
                }
            }
        }
    }

    public getFormFieldValue<T>(formFieldInstanceId: string): FormFieldValue<T> {
        return this.formFieldValues.get(formFieldInstanceId);
    }

    public async getFormFieldValueByProperty<T>(property: string): Promise<FormFieldValue<T>> {
        const field = await this.getFormFieldByProperty(property);
        if (field) {
            return this.getFormFieldValue(field.instanceId);
        }

        return this.fixedValues.get(property);
    }

    public getFormFieldByProperty(property: string): FormFieldConfiguration {
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                const field = this.findFormFieldByProperty(g.formFields, property);
                if (field) {
                    return field;
                }
            }
        }

        return null;
    }

    // TODO: Deprecated
    public getAllFormFieldValues(): Map<string, FormFieldValue<any>> {
        return this.formFieldValues;
    }

    public getFormField(formFieldInstanceId: string): FormFieldConfiguration {
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                const field = this.findFormField(g.formFields, formFieldInstanceId);
                if (field) {
                    return field;
                }
            }
        }

        return null;
    }

    private findFormField(fields: FormFieldConfiguration[], formFieldInstanceId: string): FormFieldConfiguration {
        let field: FormFieldConfiguration;
        if (fields) {
            field = fields.find((f) => f.instanceId === formFieldInstanceId);

            if (!field) {
                for (const f of fields) {
                    const foundField = this.findFormField(f.children, formFieldInstanceId);
                    if (foundField) {
                        return foundField;
                    }
                }
            }
        }

        return field;
    }

    private findFormFieldList(fields: FormFieldConfiguration[], formFieldInstanceId: string): FormFieldConfiguration[] {
        let foundFields: FormFieldConfiguration[];
        if (fields) {
            const field = fields.find((f) => f.instanceId === formFieldInstanceId);

            if (!field) {
                for (const f of fields) {
                    foundFields = this.findFormFieldList(f.children, formFieldInstanceId);
                    if (foundFields) {
                        return foundFields;
                    }
                }
            } else {
                foundFields = fields;
            }
        }

        return foundFields;
    }

    private findFormFieldByProperty(fields: FormFieldConfiguration[] = [], property: string): FormFieldConfiguration {
        let field = fields.find((f) => f.property === property);

        if (!field) {
            const dfName = KIXObjectService.getDynamicFieldName(property);
            if (dfName) {
                field = fields.filter((f) => f.property === KIXObjectProperty.DYNAMIC_FIELDS).find(
                    (f) => f.options && f.options.some(
                        (o) => o.option === DynamicFormFieldOption.FIELD_NAME && o.value === dfName
                    )
                );
            }
        }

        if (!field) {
            for (const f of fields) {
                const foundField = f.children && f.children.length ?
                    this.findFormFieldByProperty(f.children, property) : null;
                if (foundField) {
                    field = foundField;
                    break;
                }
            }
        }

        return field;
    }

    public async validateForm(): Promise<ValidationResult[]> {
        let result = [];

        if (this.form.validation) {
            for (const p of this.form.pages) {
                for (const g of p.groups) {
                    const groupResult = await this.validateFields(g.formFields);
                    result = [...result, ...groupResult];
                }
            }

            EventService.getInstance().publish(FormEvent.FORM_VALIDATED, { formInstance: this, result });
        }
        return result;
    }

    public async validatePage(page: FormPageConfiguration): Promise<ValidationResult[]> {
        let result = [];

        if (page && this.form.validation) {
            for (const g of page.groups) {
                const groupResult = await this.validateFields(g.formFields);
                result = [...result, ...groupResult];
            }

            EventService.getInstance().publish(FormEvent.FORM_PAGE_VALIDATED, { formInstance: this, page, result });
        }
        return result;
    }

    public async validateField(field: FormFieldConfiguration): Promise<ValidationResult[]> {
        let result: ValidationResult[];
        const fieldResult = await FormValidationService.getInstance().validate(field, this.form.id);
        const formFieldValue = this.getFormFieldValue(field.instanceId);
        if (formFieldValue) {
            formFieldValue.valid = fieldResult.findIndex((vr) => vr.severity === ValidationSeverity.ERROR) === -1;
            result = fieldResult;
            if ((!field.empty || field.asStructure) && field.children && !!field.children.length) {
                const childrenResult = await this.validateFields(field.children);
                result = [...result, ...childrenResult];
            }
        }
        return result;
    }

    private async validateFields(fields: FormFieldConfiguration[]): Promise<ValidationResult[]> {
        let result = [];
        for (const field of fields) {
            const r = await this.validateField(field);
            if (Array.isArray(r)) {
                result = [...result, ...r];
            }
        }
        return result;
    }

    public getObjectType(): KIXObjectType | string {
        return this.form.objectType;
    }

    public getFormContext(): FormContext {
        return this.form.formContext;
    }

    public async changeFieldOrder(changeFieldInstanceId: string, targetIndex: number): Promise<void> {
        if (changeFieldInstanceId && !isNaN(targetIndex)) {
            const startField = await this.getFormField(changeFieldInstanceId);
            if (startField) {
                const fields = await this.getFields(startField);
                if (Array.isArray(fields)) {
                    const changeIndex = fields.findIndex((c) => c.instanceId === changeFieldInstanceId);
                    if (changeIndex !== -1 && targetIndex !== changeIndex) {
                        const newIndex = targetIndex > changeIndex ? targetIndex + 1 : targetIndex;
                        const removeIndex = targetIndex < changeIndex ? changeIndex + 1 : changeIndex;
                        fields.splice(newIndex, 0, startField);
                        fields.splice(removeIndex, 1);

                        this.sortValuesByFieldList(fields);

                        const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                            this.form.objectType, ServiceType.FORM
                        );
                        if (service) {
                            await service.updateFields(fields, this);
                        }

                        EventService.getInstance().publish(FormEvent.FORM_FIELD_ORDER_CHANGED, { formInstance: this });
                    }
                }
            }
        }
    }

    private sortValuesByFieldList(fields: FormFieldConfiguration[] = []): void {
        fields.forEach((f) => {
            const value = this.formFieldValues.get(f.instanceId);
            this.formFieldValues.delete(f.instanceId);
            this.formFieldValues.set(f.instanceId, value);
            if (f.children) {
                this.sortValuesByFieldList(f.children);
            }
        });
    }

    public hasSavedValues(): boolean {
        return this.savedValues !== null;
    }

    public saveValueState(idsToSave: string[]): void {
        this.savedValues = new Map();
        this.formFieldValues.forEach(
            (value, key) => {
                if (idsToSave.some((id) => id === key)) {
                    const field = this.getFormField(key);
                    this.savedValues.set(key, [{ ...field }, value.value]);
                }
            }
        );
    }

    public loadValueState(): void {
        const values = [];
        if (this.savedValues) {
            this.savedValues.forEach((value, key) => {
                const field = this.getFormField(key);
                if (field) {
                    field.visible = value[0].visible;
                    field.readonly = value[0].readonly;
                    field.required = value[0].required;
                }
                values.push([key, value[1]]);
            });
        }
        this.templateValues.clear();
        this.savedValues = null;
        this.provideFormFieldValues(values, null);
    }

}
