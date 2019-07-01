import { ISocketRequest } from "../../ISocketRequest";

export class GetCurrentUserRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string
    ) { }

}
