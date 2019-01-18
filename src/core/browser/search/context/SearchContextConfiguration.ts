import { ContextConfiguration, ConfiguredWidget } from "../../../model";

export class SearchContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public explorer: string[],
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
        public explorerWidgets: ConfiguredWidget[],
        public content: string[],
        public contentWidgets: ConfiguredWidget[],
        public overlayWidgets: ConfiguredWidget[]
    ) {
        super(contextId, sidebars, explorer, sidebarWidgets, explorerWidgets, overlayWidgets);
    }
}
