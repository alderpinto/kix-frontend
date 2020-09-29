/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IDynamicFormManager } from './IDynamicFormManager';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { TreeNode } from '../tree';
import { DynamicFormOperationsType } from './DynamicFormOperationsType';
import { ValidationResult } from '../ValidationResult';
import { DynamicFieldTypes } from '../../../../dynamic-fields/model/DynamicFieldTypes';
import { ObjectPropertyValueOption } from '../../../../../model/ObjectPropertyValueOption';

export abstract class ExtendedDynamicFormManager implements IDynamicFormManager {

    public objectType: string;
    public uniqueProperties: boolean;
    public resetOperator?: boolean;
    public useOwnSearch?: boolean;

    public async getFieldOptions(): Promise<any[]> {
        return [];
    }

    public getValidDFTypes(): Array<DynamicFieldTypes | string> {
        return [];
    }

    public registerListener(listenerId: string, callback: () => void): void {
        return null;
    }

    public unregisterListener(listenerId: string): void {
        return null;
    }

    public init(): void {
        return null;
    }

    public reset(notify?: boolean): void {
        return null;
    }

    public getValues(): ObjectPropertyValue[] {
        return null;
    }

    public setValue(importValue: ObjectPropertyValue): Promise<void> {
        return null;
    }

    public removeValue(importValue: ObjectPropertyValue): Promise<void> {
        return null;
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return null;
    }

    public getInputType(property: string): Promise<string> {
        return null;
    }

    public getObjectReferenceObjectType(property: string): Promise<string> {
        return null;
    }

    public getSpecificInput(property: string): string {
        return null;
    }

    public getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>> {
        return null;
    }

    public getTreeNodes(property: string, objectIds?: Array<string | number>): Promise<TreeNode[]> {
        return null;
    }

    public getProperties(): Promise<Array<[string, string]>> {
        return null;
    }

    public getPropertiesPlaceholder(): Promise<string> {
        return null;
    }

    public isHiddenProperty(property: string): Promise<boolean> {
        return null;
    }

    public hasValueForProperty(property: string): boolean {
        return null;
    }

    public getOperations(property: string): Promise<string[]> {
        return null;
    }

    public getOperationsPlaceholder(): Promise<string> {
        return null;
    }

    public getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return null;
    }

    public getOperatorDisplayText(o: string): Promise<string> {
        return null;
    }

    public clearValueOnPropertyChange(property: string): Promise<boolean> {
        return null;
    }

    public isMultiselect(property: string): Promise<boolean> {
        return null;
    }

    public validate(): Promise<ValidationResult[]> {
        return null;
    }

    public shouldAddEmptyField(): Promise<boolean> {
        return null;
    }

    public searchObjectTree(property: string, searchValue: string, limit?: number): Promise<TreeNode[]> {
        return null;
    }

    public hasOption(option: ObjectPropertyValueOption, property: string, operator: string): boolean {
        return false;
    }

}
