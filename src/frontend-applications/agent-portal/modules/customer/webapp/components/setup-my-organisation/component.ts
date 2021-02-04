/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { SysConfigOption } from '../../../../sysconfig/model/SysConfigOption';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { SysConfigOptionDefinition } from '../../../../sysconfig/model/SysConfigOptionDefinition';
import { ValidationSeverity } from '../../../../base-components/webapp/core/ValidationSeverity';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { SysConfigOptionProperty } from '../../../../sysconfig/model/SysConfigOptionProperty';
import { Organisation } from '../../../model/Organisation';
import { SetupStep } from '../../../../setup-assistant/webapp/core/SetupStep';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { OrganisationProperty } from '../../../model/OrganisationProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { SetupEvent } from '../../../../setup-assistant/webapp/core/SetupEvent';
import { SetupStepCompletedEventData } from '../../../../setup-assistant/webapp/core/SetupStepCompletedEventData';
import { IdService } from '../../../../../model/IdService';
import { AuthenticationSocketClient } from '../../../../base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { SetupService } from '../../../../setup-assistant/webapp/core/SetupService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private configKeys: string[] = [];
    private step: SetupStep;
    private organisation: Organisation;
    private canOrganisationUpdate: boolean;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.configKeys = [
            'Organization',
            'OrganizationAddress',
            'OrganizationDirectors',
            'OrganizationHotline1',
            'OrganizationHotline2',
            'OrganizationLong',
            'OrganizationRegistrationLocation',
            'OrganizationRegistrationNumber'
        ];

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Save & Continue', 'Translatable#Skip & Continue'
        ]);

        await this.initOrganisation();

        if (this.organisation) {
            this.canOrganisationUpdate = await AuthenticationSocketClient.getInstance().checkPermissions([
                new UIComponentPermission(`organisations/${this.organisation.ID}`, [CRUD.UPDATE])
            ]);
        } else {
            this.canOrganisationUpdate = false;
        }

        await this.prepareForm();
        this.state.prepared = true;
    }

    public onInput(input: any): void {
        this.step = input.step;
        this.state.completed = this.step ? this.step.completed : false;
    }

    private async prepareForm(): Promise<void> {
        const sysconfigDefinitions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, this.configKeys
        );
        const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, this.configKeys
        );

        const fields = sysconfigDefinitions.map((sd) => {
            const readonly = sysconfigOptions.find((so) => so.Name === sd.Name).ReadOnly;
            const field = new FormFieldConfiguration(
                sd.Name, sd.Name, sd.Name, null, false, sd.Description,
                null, null, null, null, null, null, null, null, null, null, null, null, null,
                readonly
            );
            field.instanceId = IdService.generateDateBasedId('my-organisation-sysconfigkey-');
            return field;
        });

        const sysConfigGroup = new FormGroupConfiguration(
            'setup-my-organisation', 'Translatable#SysConfig Keys', null, null, fields
        );

        const formId = await FormService.getInstance().getFormIdByContext(FormContext.EDIT, KIXObjectType.ORGANISATION);

        const formInstance = await FormService.getInstance().getFormInstance(formId, false, this.organisation);
        const form = formInstance.getForm();
        if (form && Array.isArray(form.pages) && form.pages.length) {
            if (!this.organisation || !this.canOrganisationUpdate) {
                form.pages[0].groups = [];
            }
            form.pages[0].groups.push(sysConfigGroup);
        }

        if (!this.canOrganisationUpdate) {
            formInstance.setFormReadonly();
            formInstance.setGroupReadonly(sysConfigGroup, false);
        }

        this.state.formId = form.id;

        setTimeout(() => {
            this.initSysconfigFormValues(form.id);
        }, 100);
    }

    public onDestroy(): void {
        FormService.getInstance().deleteFormInstance(this.state.formId);
    }

    private async initOrganisation(): Promise<void> {
        let organisations: Organisation[];
        if (this.step.result && this.step.result.organisationId) {
            organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, [this.step.result.organisationId]
            );
        } else {
            organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, null,
                new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            OrganisationProperty.NUMBER, SearchOperator.EQUALS,
                            FilterDataType.STRING, FilterType.AND, 'MY_ORGA'
                        )
                    ]
                )
            );
        }

        if (Array.isArray(organisations) && organisations.length) {
            this.organisation = organisations[0];
        }
    }

    private async initSysconfigFormValues(formId: string): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);

        const sysconfigOptions = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, this.configKeys
        );

        const values: Array<[string, any]> = this.configKeys.map(
            (k) => [k, sysconfigOptions.find((o) => o.Name === k).Value]
        );

        formInstance.provideFormFieldValuesForProperties(values, null);
    }

    public async submit(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);

        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r && r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            BrowserUtil.showValidationError(result);
        } else {
            BrowserUtil.toggleLoadingShield(true, 'Translatable#Save Organisation');

            if (this.organisation && this.canOrganisationUpdate) {
                await KIXObjectService.updateObjectByForm(
                    KIXObjectType.ORGANISATION, this.state.formId, this.organisation.ID
                ).catch(() => null);
            }

            await this.saveSysconfigValues(formInstance).catch(() => null);

            const organisationId = this.organisation ? this.organisation.ID : null;
            await SetupService.getInstance().stepCompleted(this.step.id, { organisationId });

            BrowserUtil.toggleLoadingShield(false);
        }
    }

    private async saveSysconfigValues(formInstance: FormInstance): Promise<void> {
        for (const key of this.configKeys) {
            const value = await formInstance.getFormFieldValueByProperty(key);
            await KIXObjectService.updateObject(
                KIXObjectType.SYS_CONFIG_OPTION,
                [[SysConfigOptionProperty.VALUE, value.value]],
                key
            );
        }
    }

    public skip(): void {
        SetupService.getInstance().stepSkipped(this.step.id);
    }

}

module.exports = Component;
