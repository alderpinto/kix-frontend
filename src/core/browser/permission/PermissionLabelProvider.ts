import {
    Permission, KIXObjectType, PermissionProperty, ObjectIcon, User,
    DateTimeUtil, PermissionType, Role
} from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { KIXObjectService } from "../kix";
import { LabelProvider } from "../LabelProvider";

export class PermissionLabelProvider extends LabelProvider<Permission> {

    public kixObjectType: KIXObjectType = KIXObjectType.PERMISSION;

    public isLabelProviderFor(object: Permission): boolean {
        return object instanceof Permission;
    }

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.PERMISSION ||
            objectType === KIXObjectType.ROLE_PERMISSION ||
            objectType === KIXObjectType.PERMISSION_DEPENDING_OBJECTS;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case PermissionProperty.TYPE_ID:
                displayValue = 'Translatable#Type';
                break;
            case PermissionProperty.RoleID:
                displayValue = 'Translatable#Role';
                break;
            case PermissionProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case PermissionProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case PermissionProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case PermissionProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case PermissionProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case PermissionProperty.IS_REQUIRED:
                return 'Required';
            case PermissionProperty.TARGET:
                displayValue = 'Translatable#Target';
                break;
            case PermissionProperty.ID:
                displayValue = 'Translatable#Icon';
            case PermissionProperty.VALUE:
                displayValue = 'Translatable#Permission';
                break;
            case PermissionProperty.CREATE:
                displayValue = 'Create';
                break;
            case PermissionProperty.READ:
                displayValue = 'Read';
                break;
            case PermissionProperty.UPDATE:
                displayValue = 'Update';
                break;
            case PermissionProperty.DELETE:
                displayValue = 'Delete';
                break;
            case PermissionProperty.DENY:
                displayValue = 'Deny';
                break;
            default:
                displayValue = property;
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        permission: Permission, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = permission[property];

        switch (property) {
            case PermissionProperty.TYPE_ID:
                const types = await KIXObjectService.loadObjects<PermissionType>(
                    KIXObjectType.PERMISSION_TYPE, null, null, null, true
                ).catch((error) => [] as PermissionType[]);
                if (types && !!types.length) {
                    const type = types.find((t) => t.ID === permission.TypeID);
                    displayValue = type ? type.Name : permission.TypeID;
                }
                break;
            case PermissionProperty.RoleID:
                const roles = await KIXObjectService.loadObjects<Role>(
                    KIXObjectType.ROLE, [permission.RoleID]
                );
                if (roles && roles.length) {
                    displayValue = roles[0].Name;
                }
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case PermissionProperty.CREATE_BY:
            case PermissionProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case PermissionProperty.CREATE_TIME:
            case PermissionProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case PermissionProperty.TYPE_ID:
                const types = await KIXObjectService.loadObjects<PermissionType>(
                    KIXObjectType.PERMISSION_TYPE, null, null, null, true
                ).catch((error) => [] as PermissionType[]);
                if (types && !!types.length) {
                    const type = types.find((t) => t.ID === value);
                    displayValue = type ? type.Name : value;
                }
                break;
            default:
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(
        object: Permission, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return await this.getObjectName(false, translatable);
    }

    public getObjectIcon(object?: Permission): string | ObjectIcon {
        return new ObjectIcon('Permission', object.ID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Permissions' : 'Translatable#Permission'
            );
        }
        return plural ? 'Permissions' : 'Permission';
    }

    public getObjectTooltip(object: Permission): string {
        return object.ID.toString();
    }

    public async getIcons(
        object: Permission, property: string, value?: any
    ): Promise<Array<string | ObjectIcon>> {
        if (property === PermissionProperty.ID) {
            return [new ObjectIcon('Permission', object.ID)];
        } else if (property === PermissionProperty.IS_REQUIRED) {
            return value ? ['kix-icon-check'] : null;
        }
        return null;
    }

}
