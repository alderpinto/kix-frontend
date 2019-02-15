import { ObjectIcon, KIXObjectType } from "../model";

export interface ILabelProvider<T> {

    kixObjectType: KIXObjectType;

    isLabelProviderFor(object: T): boolean;

    getPropertyText(property: string, short?: boolean): Promise<string>;

    getPropertyIcon(property: string): Promise<string | ObjectIcon>;

    getDisplayText(object: T, property: string, defaultValue?: string): Promise<string>;

    getPropertyValueDisplayText(property: string, value: string | number): Promise<string>;

    getDisplayTextClasses(object: T, property: string): string[];

    getObjectClasses(object: T): string[];

    getObjectText(object: T, id?: boolean, title?: boolean): Promise<string>;

    getObjectAdditionalText(object: T): string;

    getObjectIcon(object?: T): string | ObjectIcon;

    getObjectName(plural?: boolean): string;

    getObjectTooltip(object: T): string;

    getIcons(object: T, property: string, value?: string | number): Promise<Array<string | ObjectIcon>>;

}
