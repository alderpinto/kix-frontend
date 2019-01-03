import { ConfiguredWidget } from "../../../../../model";
import { ContextConfiguration } from '../../../../../model/components/context/ContextConfiguration';

export class EditTicketPriorityDialogContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
    ) {
        super(contextId, sidebars, [], sidebarWidgets, [], []);
    }

}
