import { ISocketResponse } from "../ISocketResponse";
import { MenuEntry } from "../../components";

export class MainMenuEntriesResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public primaryMenuEntries: MenuEntry[],
        public secondaryMenuEntries: MenuEntry[],
        public showText: boolean
    ) { }

}