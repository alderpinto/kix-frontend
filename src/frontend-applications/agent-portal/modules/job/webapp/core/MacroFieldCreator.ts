/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormContext } from '../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { IdService } from '../../../../model/IdService';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FormFactory } from '../../../base-components/webapp/core/FormFactory';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { JobProperty } from '../../model/JobProperty';
import { Macro } from '../../model/Macro';
import { MacroAction } from '../../model/MacroAction';
import { MacroActionType } from '../../model/MacroActionType';
import { MacroActionTypeOption } from '../../model/MacroActionTypeOption';
import { MacroActionTypeResult } from '../../model/MacroActionTypeResult';
import { MacroProperty } from '../../model/MacroProperty';
import { AbstractJobFormManager } from './AbstractJobFormManager';

export class MacroFieldCreator {
    public static async createMacroField(
        macro: Macro, formInstance: FormInstance, jobManager: AbstractJobFormManager, parentInstanceId: string = ''
    ): Promise<FormFieldConfiguration> {
        const macroField = new FormFieldConfiguration(
            'job-form-field-macro', '', JobProperty.MACROS, 'job-input-macro'
        );

        macroField.required = false;
        macroField.empty = true;
        macroField.label = 'Translatable#Macro';
        macroField.asStructure = true;
        macroField.showLabel = true;
        macroField.instanceId = `${parentInstanceId}###MACRO###${IdService.generateDateBasedId()}`;
        macroField.draggableFields = true;

        if (macro && formInstance && formInstance.getFormContext() === FormContext.EDIT) {
            macroField.options = [
                new FormFieldOption('MacroId', macro.ID)
            ];

            if (macro.ExecOrder && macro.ExecOrder.length) {
                const actions = this.getSortedActions(macro);

                for (const action of actions) {
                    const actionField = await this.createActionField(macroField, action);

                    const childFields = await this.createActionOptionFields(
                        action.Type, actionField.instanceId, macro.Type, formInstance, jobManager, action
                    );
                    actionField.children = childFields;

                    macroField.children.push(actionField);

                    // Provide values for fields
                    const values: Array<[string, any]> = [
                        [actionField.instanceId, actionField.defaultValue.value]
                    ];
                    actionField.children.forEach((c) => {
                        if (c.defaultValue) {
                            values.push([c.instanceId, c.defaultValue.value]);
                        }
                    });

                    await formInstance.provideFormFieldValues(values, null, true);
                }

                for (let i = 0; i < macroField.children.length; i++) {
                    const label = await TranslationService.translate('Translatable#{0}. Action', [i + 1]);
                    macroField.children[i].label = label;
                }
            }
        } else {
            const actionField = await this.createActionField(macroField, null);
            macroField.children.push(actionField);
        }

        return macroField;
    }

    private static getSortedActions(macro: Macro): MacroAction[] {
        const actions: MacroAction[] = [];

        macro.ExecOrder.forEach((aId) => {
            const action = macro.Actions.find((a) => a.ID === aId);
            if (action) {
                actions.push(action);
            }
        });

        macro.Actions.forEach((ma) => {
            if (!actions.some((a) => a.ID === ma.ID)) {
                actions.push(ma);
            }
        });

        return actions;
    }

    public static async createActionField(
        macroField: FormFieldConfiguration, action: MacroAction
    ): Promise<FormFieldConfiguration> {
        const actionField = new FormFieldConfiguration(
            'job-form-field-actions', '1. Action', `MACRO###${JobProperty.MACRO_ACTIONS}`, 'job-input-actions'
        );

        actionField.options = [
            new FormFieldOption('ActionId', action ? action.ID : null)
        ];

        actionField.required = false;
        actionField.hint = 'Translatable#Helptext_Admin_JobCreateEdit_Actions';
        actionField.countDefault = 1;
        actionField.countMax = 200;
        actionField.countMin = 0;
        actionField.defaultValue = new FormFieldValue(action ? action.Type : null);
        actionField.instanceId = `${macroField.instanceId}###${actionField.property}###${IdService.generateDateBasedId()}`;
        actionField.property = JobProperty.MACRO_ACTIONS;
        actionField.parentInstanceId = macroField.instanceId;
        actionField.parent = macroField;

        return actionField;
    }

    public static async createActionOptionFields(
        actionType: string, actionFieldInstanceId: string, jobType: string,
        formInstance: FormInstance, jobManager: AbstractJobFormManager, action?: MacroAction,
    ): Promise<FormFieldConfiguration[]> {
        const fieldOrderMap: Map<string, number> = new Map();
        let fields: FormFieldConfiguration[] = [];
        if (!actionFieldInstanceId || !actionType) {
            console.error('Missing "actionFieldInstanceId" or actionType!');
        } else {
            const macroActionTypes = await KIXObjectService.loadObjects<MacroActionType>(
                KIXObjectType.MACRO_ACTION_TYPE, [actionType], null, { id: jobType }, true
            ).catch((error): MacroActionType[] => []);

            if (Array.isArray(macroActionTypes) && macroActionTypes.length) {
                const options = macroActionTypes[0].Options;
                for (const optionName in options) {
                    if (optionName) {
                        const option = options[optionName] as MacroActionTypeOption;
                        if (option) {
                            const optionField = await this.createOptionField(
                                action, option, actionType, actionFieldInstanceId, jobType, formInstance, jobManager
                            );

                            // split values if it is an array option field
                            if (optionField.countMax > 1 && Array.isArray(optionField.defaultValue.value)) {
                                for (const value of optionField.defaultValue.value) {
                                    const clonedOptionField = this.cloneOptionField(
                                        optionField, value, actionFieldInstanceId, option.Name
                                    );
                                    fieldOrderMap.set(clonedOptionField.instanceId, option.Order);
                                    fields.push(clonedOptionField);
                                }
                            } else {
                                fieldOrderMap.set(optionField.instanceId, option.Order);
                                fields.push(optionField);
                            }
                        }
                    }
                }

                fields = fields.sort((a, b) => fieldOrderMap.get(a.instanceId) - fieldOrderMap.get(b.instanceId));

                const skip = await this.createSkipField(actionType, actionFieldInstanceId, action);
                fields.unshift(skip);

                const resultField = await this.createResultField(
                    action, macroActionTypes[0], actionFieldInstanceId, formInstance
                );
                if (resultField) {
                    fields.unshift(resultField);
                }
            }
        }
        return fields;
    }

    public static async createResultField(
        action: MacroAction, actionType: MacroActionType, actionFieldInstanceId: string, formInstance: FormInstance
    ): Promise<FormFieldConfiguration> {

        const fields: FormFieldConfiguration[] = [];
        const values = [];
        for (const resultName in actionType.Results) {
            if (resultName) {
                const result = actionType.Results[resultName] as MacroActionTypeResult;
                if (result) {

                    const resultField = new FormFieldConfiguration(
                        `job-action-${actionType.Name}-result-${result.Name}`,
                        result.Name,
                        `${actionFieldInstanceId}###RESULT###${result.Name}`,
                        null
                    );

                    resultField.instanceId = `${actionFieldInstanceId}###ResultGroup###${result.Name}`;
                    resultField.required = false;
                    resultField.hint = result.Description;

                    let defaultValue: string;
                    if (action && action.ResultVariables) {
                        defaultValue = action.ResultVariables[result.Name];
                        values.push([resultField.instanceId, defaultValue]);
                    }

                    resultField.defaultValue = typeof defaultValue !== 'undefined'
                        ? new FormFieldValue(defaultValue)
                        : undefined;
                    resultField.options = [
                        new FormFieldOption('ResultName', result.Name)
                    ];

                    fields.push(resultField);
                }
            }
        }

        await formInstance.provideFormFieldValues(values, null, true);

        const resultParentField = new FormFieldConfiguration(
            `job-action-${actionType.Name}-resultGroup`, 'Translatable#Result names', `${actionFieldInstanceId}###RESULTGROUP`, null
        );

        resultParentField.instanceId = `${actionFieldInstanceId}###RESULTGROUP`;
        resultParentField.required = false;
        resultParentField.hint = 'Translatable#An optional mapping of named results of the macro action and their variable names. The variable can be used as special placeholder in following actions like "${VariableName}".';
        resultParentField.children = fields;
        resultParentField.empty = true;
        resultParentField.asStructure = true;
        resultParentField.options = [
            new FormFieldOption('ResultVariables', 'ResultVariables')
        ];

        return fields.length ? resultParentField : null;
    }

    public static async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string, formInstance: FormInstance, jobManager: AbstractJobFormManager
    ): Promise<FormFieldConfiguration> {
        const nameOption = new FormFieldOption('OptionName', option.Name);

        if (jobManager) {
            for (const extendedManager of jobManager.extendedJobFormManager) {
                const result = extendedManager.createOptionField(
                    action, option, actionType, actionFieldInstanceId, jobType
                );

                if (result) {
                    result.instanceId = `${actionFieldInstanceId}###${option.Name}`;
                    if (Array.isArray(result.options)) {
                        result.options.push(nameOption);
                    } else {
                        result.options = [nameOption];
                    }
                    return result;
                }
            }
        }

        let defaultValue;
        if (action && action.Parameters) {
            defaultValue = action.Parameters[option.Name];
        }

        let optionField = new FormFieldConfiguration(
            `job-action-${actionType}-${option.Name}`, option.Label, `${actionFieldInstanceId}###${option.Name}`, null
        );

        optionField.instanceId = `${actionFieldInstanceId}###${option.Name}`;
        optionField.required = Boolean(option.Required);
        optionField.hint = option.Description;
        optionField.defaultValue = typeof defaultValue !== 'undefined' ? new FormFieldValue(defaultValue) : undefined;
        optionField.property = optionField.instanceId;

        if (actionType === 'Loop' && option.Name === 'MacroID') {
            let subMacro: Macro;
            if (defaultValue) {
                let macroIds: number[] = defaultValue;
                if (!Array.isArray(defaultValue)) {
                    macroIds = [defaultValue];
                }

                const macros = await KIXObjectService.loadObjects<Macro>(
                    KIXObjectType.MACRO, macroIds,
                    new KIXObjectLoadingOptions(null, null, null, [MacroProperty.ACTIONS])
                ).catch((e): Macro[] => []);

                if (Array.isArray(macros) && macros.length) {
                    subMacro = macros[0];
                }
            }
            optionField = await this.createMacroField(subMacro, formInstance, jobManager, actionFieldInstanceId);
        }

        optionField.parentInstanceId = actionFieldInstanceId;
        optionField.options.push(nameOption);

        return optionField;
    }

    private static cloneOptionField(
        optionField: FormFieldConfiguration, value: any, actionFieldInstanceId: string, optionName: string
    ) {
        const field = FormFactory.cloneField(optionField);
        field.instanceId = IdService.generateDateBasedId(optionField.id);
        field.defaultValue = new FormFieldValue(value);
        // special instance id to distinguish between the actions
        field.existingFieldId = IdService.generateDateBasedId(`${actionFieldInstanceId}###${optionName}`);
        return field;
    }

    public static async createSkipField(
        actionType: string, actionFieldInstanceId: string, action?: MacroAction
    ): Promise<FormFieldConfiguration> {
        let value: any;
        if (action) {
            value = action[KIXObjectProperty.VALID_ID] !== 1;
        }
        const skipField = new FormFieldConfiguration(
            `job-action-${actionType}-skip`, 'Translatable#Skip', `${actionFieldInstanceId}###SKIP`, 'checkbox-input'
        );

        skipField.instanceId = IdService.generateDateBasedId(`${actionFieldInstanceId}###SKIP`);
        skipField.required = false;
        skipField.hint = 'Translatable#Helptext_Admin_JobCreateEdit_ActionSkip';
        skipField.defaultValue = typeof value !== 'undefined'
            ? new FormFieldValue(value)
            : new FormFieldValue(false);

        skipField.options = [
            new FormFieldOption('OptionName', 'Skip')
        ];

        return skipField;
    }
}