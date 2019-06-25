import {
    CreateObjectIcon, CreateObjectIconRequest, CreateObjectIconResponse,
    UpdateObjectIcon, UpdateObjectIconResponse, UpdateObjectIconRequest
} from '../../../api';
import {
    ObjectIcon, KIXObjectType, KIXObjectLoadingOptions, ObjectIconLoadingOptions, Error
} from '../../../model';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';
import { ObjectIconFactory } from '../../object-factories/ObjectIconFactory';

export class ObjectIconService extends KIXObjectService {

    private static INSTANCE: ObjectIconService;

    public static getInstance(): ObjectIconService {
        if (!ObjectIconService.INSTANCE) {
            ObjectIconService.INSTANCE = new ObjectIconService();
        }
        return ObjectIconService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'objecticons');

    public objectType: KIXObjectType = KIXObjectType.OBJECT_ICON;

    private constructor() {
        super([new ObjectIconFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.OBJECT_ICON;
    }

    public loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, iconLoadingOptions: ObjectIconLoadingOptions
    ): Promise<T[]> {

        return new Promise<T[]>((resolve, reject) => {
            let objects = [];
            if (objectType === KIXObjectType.OBJECT_ICON) {
                this.getObjectIcons(token).then((objectIcons) => {
                    if (objectIds && objectIds.length) {
                        objects = objectIcons.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
                    } else if (iconLoadingOptions) {
                        if (iconLoadingOptions.object && iconLoadingOptions.objectId) {
                            const icon = objectIcons.find(
                                (oi) => oi.Object === iconLoadingOptions.object
                                    && oi.ObjectID.toString() === iconLoadingOptions.objectId.toString()
                            );
                            if (icon) {
                                objects = [icon];
                            }
                        }
                    } else {
                        objects = objectIcons;
                    }

                    resolve(objects);
                });
            }
        });
    }

    public async getObjectIcons(token: string): Promise<ObjectIcon[]> {
        return await super.load<ObjectIcon>(
            token, KIXObjectType.OBJECT_ICON, this.RESOURCE_URI, null, null, 'ObjectIcon'
        );
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>
    ): Promise<string | number> {

        const createObjectIcon = new CreateObjectIcon(parameter);
        const response = await this.sendCreateRequest<CreateObjectIconResponse, CreateObjectIconRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateObjectIconRequest(createObjectIcon), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.ObjectIconID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateObjectIcon = new UpdateObjectIcon(parameter);

        const response = await this.sendUpdateRequest<UpdateObjectIconResponse, UpdateObjectIconRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId),
            new UpdateObjectIconRequest(updateObjectIcon), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.ObjectIconID;
    }
}
