import {
    CreateTicketType, CreateTicketTypeResponse, CreateTicketTypeRequest,
    UpdateTicketType, UpdateTicketTypeResponse, UpdateTicketTypeRequest
} from '../../../api';
import {
    TicketType, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, ObjectIcon, Error, TicketTypeFactory
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';

export class TicketTypeService extends KIXObjectService {

    private static INSTANCE: TicketTypeService;

    public static getInstance(): TicketTypeService {
        if (!TicketTypeService.INSTANCE) {
            TicketTypeService.INSTANCE = new TicketTypeService();
        }
        return TicketTypeService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'tickettypes';

    public objectType: KIXObjectType = KIXObjectType.TICKET_TYPE;

    private constructor() {
        super([new TicketTypeFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_TYPE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TICKET_TYPE) {
            objects = await super.load<TicketType>(
                token, KIXObjectType.TICKET_TYPE, this.RESOURCE_URI, loadingOptions, objectIds, 'TicketType'
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const createTicketType = new CreateTicketType(parameter);

        const response = await this.sendCreateRequest<CreateTicketTypeResponse, CreateTicketTypeRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateTicketTypeRequest(createTicketType), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'TicketType';
            icon.ObjectID = response.TypeID;
            await this.createIcons(token, clientRequestId, icon);
        }

        return response.TypeID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateTicketType = new UpdateTicketType(parameter);

        const response = await this.sendUpdateRequest<UpdateTicketTypeResponse, UpdateTicketTypeRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId),
            new UpdateTicketTypeRequest(updateTicketType), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'TicketType';
            icon.ObjectID = response.TypeID;
            await this.updateIcon(token, clientRequestId, icon);
        }

        return response.TypeID;
    }

}
