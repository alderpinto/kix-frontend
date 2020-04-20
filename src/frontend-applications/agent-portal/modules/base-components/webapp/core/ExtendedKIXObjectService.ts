/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../../../../model/kix/KIXObject";
import { IKIXObjectService } from "./IKIXObjectService";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { KIXObjectSpecificLoadingOptions } from "../../../../model/KIXObjectSpecificLoadingOptions";
import { KIXObjectSpecificCreateOptions } from "../../../../model/KIXObjectSpecificCreateOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { TreeNode } from "./tree";
import { TableFilterCriteria } from "../../../../model/TableFilterCriteria";
import { KIXObjectSpecificDeleteOptions } from "../../../../model/KIXObjectSpecificDeleteOptions";
import { IAutofillConfiguration } from "./IAutofillConfiguration";
import { RoutingConfiguration } from "../../../../model/configuration/RoutingConfiguration";
import { ServiceType } from "./ServiceType";

export abstract class ExtendedKIXObjectService<T extends KIXObject = KIXObject> implements IKIXObjectService<T> {

    public loadObjects<O extends KIXObject<any>>(
        kixObjectType: string, objectIds: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions,
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions, cache?: boolean, forceIds?: boolean
    ): Promise<O[]> {
        return null;
    }


    public createObject(
        kixObjectType: string, object: KIXObject<any>, createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        return null;
    }

    public createObjectByForm(
        objectType: string, formId: string, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        return null;
    }

    public updateObjectByForm(objectType: string, formId: string, objectId: string | number): Promise<string | number> {
        return null;
    }

    public prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        return null;
    }

    public getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<TreeNode[]> {
        return null;
    }

    public checkFilterValue(object: T, criteria: TableFilterCriteria): Promise<boolean> {
        return null;
    }

    public determineDependendObjects(sourceObjects: T[], targetObjectType: string): string[] | number[] {
        return null;
    }

    public getLinkObjectName(): string {
        return null;
    }

    public deleteObject(
        objectType: string, objectId: string | number, deleteOptions?: KIXObjectSpecificDeleteOptions
    ): Promise<void> {
        return null;
    }

    public getAutoFillConfiguration(textMatch: any, placeholder: string): Promise<IAutofillConfiguration> {
        return null;
    }

    public getObjectUrl(object?: KIXObject<any>, objectId?: string | number): Promise<string> {
        return null;
    }

    public prepareObjectTree(
        objects: Array<KIXObject<any>>, showInvalid?: boolean, invalidClickable?: boolean,
        filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        return null;
    }

    public getObjectRoutingConfiguration(
        object?: KIXObject<any>): RoutingConfiguration {
        return null;
    }

    public hasReadPermissionFor(linkableObjectType: string): Promise<boolean> {
        return null;
    }

    public isServiceFor(kixObjectType: string): boolean {
        return null;
    }

    public isServiceType(kixObjectServiceType: ServiceType): boolean {
        return null;
    }

}