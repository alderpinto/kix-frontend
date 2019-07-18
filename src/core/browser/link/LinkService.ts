/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService, ServiceRegistry, IKIXObjectService } from "../kix";
import { Link, KIXObjectType, KIXObject, LinkObject } from "../../model";

export class LinkService extends KIXObjectService<Link> {

    private static INSTANCE: LinkService = null;

    public static getInstance(): LinkService {
        if (!LinkService.INSTANCE) {
            LinkService.INSTANCE = new LinkService();
        }

        return LinkService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.LINK
            || kixObjectType === KIXObjectType.LINK_OBJECT
            || kixObjectType === KIXObjectType.LINK_TYPE;
    }

    public getLinkObjectName(): string {
        return 'LinkObject';
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        if (object && object instanceof LinkObject) {
            const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(
                object.linkedObjectType
            );
            return service ? await service.getObjectUrl(null, object.linkedObjectKey) : null;
        }
        return await super.getObjectUrl(object);
    }

}
