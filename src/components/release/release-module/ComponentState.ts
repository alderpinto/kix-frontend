import { ConfiguredWidget } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public contentWidgets: ConfiguredWidget[] = [],
        public kixVersionString: string = ''
    ) { }

}
