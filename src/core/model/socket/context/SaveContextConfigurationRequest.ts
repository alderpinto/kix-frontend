import { ISocketRequest } from "../ISocketRequest";

export class SaveContextConfigurationRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public contextId: string,
        public configuration: any
    ) { }

}
