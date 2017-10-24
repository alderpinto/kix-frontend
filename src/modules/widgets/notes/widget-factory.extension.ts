import { IWidget, IWidgetFactoryExtension, WidgetConfiguration } from '@kix/core';

import { NotesConfiguration } from './../../../components/widgets/notes/model/NotesConfiguration';
import { NotesWidget } from './NotesSidebar';

export class NotesWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new NotesWidget(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "notes-widget";
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/notes';
    }

    public getConfigurationTemplate(): string {
        return this.getTemplate() + '/configuration';
    }

    public getDefaultConfiguration(): WidgetConfiguration {
        return new WidgetConfiguration("Notes", [], new NotesConfiguration());
    }

}

module.exports = (data, host, options) => {
    return new NotesWidgetFactoryExtension();
};
