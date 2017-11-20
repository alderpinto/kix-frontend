import { IWidget, WidgetSize } from '@kix/core/dist/model';

export class ChartWidget implements IWidget {

    public id: string;

    public instanceId: string = Date.now().toString();

    public show: boolean = true;

    public size: WidgetSize.SMALL;

    public constructor(id: string) {
        this.id = id;
    }
}
