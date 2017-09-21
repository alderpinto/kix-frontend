import { SearchTemplatesWidget } from './SearchTemplatesWidget';
import { IWidgetFactoryExtension, IWidget } from '@kix/core';

export class SearchTemplatesWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new SearchTemplatesWidget(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "search-templates-widget";
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/search-templates';
    }

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new SearchTemplatesWidgetFactoryExtension();
};
