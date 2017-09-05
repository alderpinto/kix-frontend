import { IWidget } from './../../../model/client/components/widget/IWidget';
import { IWidgetFactoryExtension } from './../../../extensions/IWidgetExtension';
import { StatisticWidget } from './StatisticsWidget';

export class StatisticsWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new StatisticWidget();
    }

    public getWidgetId(): string {
        return "statistics-widget";
    }

}

module.exports = (data, host, options) => {
    return new StatisticsWidgetFactoryExtension();
};
