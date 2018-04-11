import { IModuleFactoryExtension } from '@kix/core/dist/extensions';

export class ServicesModuleFactoryExtension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return "services-dashboard";
    }

    public getDefaultConfiguration(): any {
        const content = {};
        return content;
    }

    public createFormularDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ServicesModuleFactoryExtension();
};
