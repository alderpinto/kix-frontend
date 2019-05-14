import { WidgetComponentState, Organisation, Contact, AbstractAction } from "../../../../core/model";
import { TableConfiguration, ITable } from "../../../../core/browser";

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public organisation: Organisation = null,
        public table: ITable = null,
        public filterValue: string = '',
        public title: string = '',
        public actions: AbstractAction[] = [],
        public filterCount: number = null
    ) {
        super();
    }

}
