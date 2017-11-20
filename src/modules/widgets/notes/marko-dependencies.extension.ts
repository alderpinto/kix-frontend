import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class NotesWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/notes"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new NotesWidgetMarkoDependencyExtension();
};
