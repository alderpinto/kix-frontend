/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    KIXObjectType, InputFieldTypes, SortUtil, Role, KIXObjectLoadingOptions,
    FilterCriteria, RoleProperty, FilterDataType, FilterType
} from "../../../model";
import { DynamicFormOperationsType, AbstractDynamicFormManager } from "../../form";
import { KIXObjectService } from "../../kix";
import { ObjectPropertyValue } from "../../ObjectPropertyValue";
import { SearchOperator } from "../../SearchOperator";

export class RolePermissionManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.ROLE;
    private isDependentObjectPermission: boolean = false;

    public setIsDependentObjectPermission(isDependent: boolean = false): void {
        this.isDependentObjectPermission = isDependent;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return 'SPECIFIC';
    }

    public getSpecificInput(): string {
        return 'permission-input';
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return true;
    }

    public async getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>> {
        return [
            ['showRequired', this.isDependentObjectPermission],
            ['checkPermissionType', false]
        ];
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [];
        const roles = await KIXObjectService.loadObjects<Role>(this.objectType, null, new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    RoleProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
                )
            ]
        ));
        for (const role of roles) {
            properties.push([role.ID.toString(), role.Name]);
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async getPropertiesPlaceholder(): Promise<string> {
        return 'Translatable#Role';
    }

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return DynamicFormOperationsType.NONE;
    }
}
