/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { DynamicField } from '../../model/DynamicField';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { DynamicFieldType } from '../../model/DynamicFieldType';

export class DynamicFieldService extends KIXObjectService<DynamicField> {

    private schema: Map<string, any> = new Map();
    private schemaHandler: Map<string, () => Promise<void>> = new Map();

    private static INSTANCE: DynamicFieldService = null;

    public static getInstance(): DynamicFieldService {
        if (!DynamicFieldService.INSTANCE) {
            DynamicFieldService.INSTANCE = new DynamicFieldService();
        }

        return DynamicFieldService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.DYNAMIC_FIELD
            || kixObjectType === KIXObjectType.DYNAMIC_FIELD_TYPE;
    }

    public getLinkObjectName(): string {
        return 'DynamicField';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.DYNAMIC_FIELD) {
            objects = await super.loadObjects<O>(KIXObjectType.DYNAMIC_FIELD, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects as any[];
    }

    public registerConfigSchema(id: string, schema: any): void {
        this.schema.set(id, schema);
    }

    public registerConfigSchemaHandler(id: string, handler: () => Promise<any>): void {
        this.schemaHandler.set(id, handler);
    }

    public async getConfigSchema(id: string): Promise<any> {
        let schema = this.schema.get(id);
        if (!schema) {
            const handler = this.schemaHandler.get(id);
            if (handler) {
                schema = await handler();
            }
        }
        return schema;
    }

    public async prepareObjectTree(
        dynamicFieldType: DynamicFieldType[], showInvalid?: boolean,
        invalidClickable?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        if (dynamicFieldType && !!dynamicFieldType.length) {
            for (const o of dynamicFieldType) {
                const fieldType = o.Name;
                if (await DynamicFieldService.getInstance().getConfigSchema(fieldType)) {

                    nodes.push(new TreeNode(fieldType, await LabelService.getInstance().getObjectText(o)));
                }
            }
        }
        return nodes;
    }
}
