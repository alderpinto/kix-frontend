import { WidgetComponentState, AbstractAction, ConfigItem } from "../../../../core/model";
import { DisplayImageDescription } from "../../../../core/browser/components/DisplayImageDescription";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public configItem: ConfigItem = null,
        public actions: AbstractAction[] = [],
        public loading: boolean = true,
        public widgetTitle: string = '',

        // TODO: bei korrekter Graph-Implementierung wieder entfernen
        public fakeGraph: string = 'graph_klein.jpg',
        public fakeGraphLarge: DisplayImageDescription =
            new DisplayImageDescription(1, '/static/img/config-item-graph/graph_gross.jpg', 'Verknüpfungsgraph')
    ) {
        super();
    }

}
