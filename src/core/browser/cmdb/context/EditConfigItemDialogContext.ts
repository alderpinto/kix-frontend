/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../model/components/context/Context";
import {
    ContextDescriptor, ContextConfiguration, KIXObject, KIXObjectType, KIXObjectLoadingOptions, VersionProperty
} from "../../../model";
import { KIXObjectService } from "../../kix";

export class EditConfigItemDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-config-item-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                ['Versions', 'Links', VersionProperty.DEFINITION, VersionProperty.DATA, VersionProperty.PREPARED_DATA],
                ['Links']
            );
            const objects = await KIXObjectService.loadObjects(objectType, [objectId], loadingOptions);
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }

}
