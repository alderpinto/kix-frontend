/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { FormInputComponent } from "../../../../base-components/webapp/core/FormInputComponent";
import { IdService } from "../../../../../model/IdService";
import { PermissionManager } from "../../core/admin";
import { CreatePermissionDescription } from "../../../server/CreatePermissionDescription";
import { PermissionFormData } from "../../../../base-components/webapp/core/PermissionFormData";
import { IDynamicFormManager } from "../../../../base-components/webapp/core/dynamic-form";
import { Permission } from "../../../model/Permission";
import { ObjectPropertyValue } from "../../../../../model/ObjectPropertyValue";
import { LabelService } from "../../../../base-components/webapp/core/LabelService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { CRUD } from "../../../../../../../server/model/rest/CRUD";

class Component extends FormInputComponent<any[], ComponentState> {

    private formListenerId: string;
    private permissionFormTimeout: any;

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('permission-form-listener-');
        await this.prepareTitles();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const permissionManager = new PermissionManager();
        if (permissionManager) {
            permissionManager.init();
            await this.setCurrentNode(permissionManager);
            this.state.permissionManager = permissionManager;
            this.state.permissionManager.registerListener(this.formListenerId, () => {
                if (this.permissionFormTimeout) {
                    clearTimeout(this.permissionFormTimeout);
                }
                this.permissionFormTimeout = setTimeout(async () => {
                    const permissionDescriptions: CreatePermissionDescription[] = [];
                    if (this.state.permissionManager.hasDefinedValues()) {
                        const values = this.state.permissionManager.getEditableValues();
                        values.forEach((v) => {
                            const crudValue = this.getPermissionValueFromCRUD(v.value);
                            if (v.property && v.operator) {
                                permissionDescriptions.push(
                                    new CreatePermissionDescription(
                                        Number(v.property),
                                        v.operator,
                                        v.value && (v.value as PermissionFormData).IsRequired ? 1 : 0,
                                        crudValue,
                                        v.value && (v.value as PermissionFormData).Comment,
                                        null,
                                        typeof v.id !== 'undefined' && v.id !== null ? Number(v.id) : null
                                    )
                                );
                            }
                        });
                    }
                    super.provideValue(permissionDescriptions);
                }, 200);
            });
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.state.permissionManager) {
            this.state.permissionManager.unregisterListener(this.formListenerId);
        }
    }

    public async setCurrentNode(permissionManager: IDynamicFormManager): Promise<void> {
        const permissionDescriptions: CreatePermissionDescription[] = [];
        if (this.state.defaultValue && this.state.defaultValue.value && Array.isArray(this.state.defaultValue.value)) {
            this.state.defaultValue.value.forEach((permission: Permission) => {
                permissionManager.setValue(
                    new ObjectPropertyValue(
                        permission.TypeID.toString(), permission.Target, this.getPermissionFormData(permission), false,
                        true, null, null, null, permission.ID.toString()
                    )
                );
                permissionDescriptions.push(
                    new CreatePermissionDescription(
                        permission.TypeID,
                        permission.Target,
                        permission.IsRequired,
                        permission.Value,
                        permission.Comment,
                        null,
                        permission.ID
                    )
                );
            });
        }
        super.provideValue(permissionDescriptions);
    }

    private async prepareTitles(): Promise<void> {
        this.state.createTitle = await LabelService.getInstance().getPropertyText(
            this.state.createTitle, KIXObjectType.PERMISSION, false, false
        );
        this.state.readTitle = await LabelService.getInstance().getPropertyText(
            this.state.readTitle, KIXObjectType.PERMISSION, false, false
        );
        this.state.updateTitle = await LabelService.getInstance().getPropertyText(
            this.state.updateTitle, KIXObjectType.PERMISSION, false, false
        );
        this.state.deleteTitle = await LabelService.getInstance().getPropertyText(
            this.state.deleteTitle, KIXObjectType.PERMISSION, false, false
        );
        this.state.denyTitle = await LabelService.getInstance().getPropertyText(
            this.state.denyTitle, KIXObjectType.PERMISSION, false, false
        );
        this.state.requiredTitle = await LabelService.getInstance().getPropertyText(
            this.state.requiredTitle, KIXObjectType.PERMISSION, false, false
        );
    }

    private getPermissionValueFromCRUD(permissionData: PermissionFormData): number {
        const value: number = permissionData ? (permissionData.CREATE ? CRUD.CREATE : 0)
            + (permissionData.READ ? CRUD.READ : 0)
            + (permissionData.UPDATE ? CRUD.UPDATE : 0)
            + (permissionData.DELETE ? CRUD.DELETE : 0)
            + (permissionData.DENY ? CRUD.DENY : 0) : 0;
        return value;
    }

    private getPermissionFormData(permission: Permission): PermissionFormData {
        const permissionFormData = new PermissionFormData();
        permissionFormData.IsRequired = permission.IsRequired === 1;
        permissionFormData.Comment = permission.Comment;
        if (permission.Value) {
            permissionFormData.CREATE = !!(permission.Value & CRUD.CREATE);
            permissionFormData.READ = !!(permission.Value & CRUD.READ);
            permissionFormData.UPDATE = !!(permission.Value & CRUD.UPDATE);
            permissionFormData.DELETE = !!(permission.Value & CRUD.DELETE);
            permissionFormData.DENY = !!(permission.Value & CRUD.DENY);
        }
        return permissionFormData;
    }
}

module.exports = Component;
