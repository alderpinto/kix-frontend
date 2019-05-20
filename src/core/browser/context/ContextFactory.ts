import { Context, KIXObjectType, ContextMode, ContextDescriptor, ContextType } from "../../model";
import { ContextSocketClient } from "./ContextSocketClient";

export class ContextFactory {

    private static INSTANCE: ContextFactory;

    public static getInstance(): ContextFactory {
        if (!ContextFactory.INSTANCE) {
            ContextFactory.INSTANCE = new ContextFactory();
        }
        return ContextFactory.INSTANCE;
    }

    private constructor() { }

    private registeredDescriptors: ContextDescriptor[] = [];
    private contextInstances: Context[] = [];
    private contextCreatePromises: Map<string, Promise<any>> = new Map();

    public registerContext(contextDescriptor: ContextDescriptor): void {
        this.registeredDescriptors.push(contextDescriptor);
    }

    public async getContext(
        contextId: string, objectType: KIXObjectType, contextMode: ContextMode,
        objectId?: string | number, reset?: boolean
    ): Promise<Context> {
        let context = this.contextInstances.find(
            (c) => this.isContext(contextId, c.getDescriptor(), objectType, contextMode)
        );

        if (!context) {
            context = await this.createContextInstance(contextId, objectType, contextMode, objectId);
        } else if (reset) {
            const configuration = await ContextSocketClient.loadContextConfiguration(context.getDescriptor().contextId);
            context.setConfiguration(configuration);
            context.reset();
        }

        return context;
    }

    public getContextDescriptor(contextId: string): ContextDescriptor {
        const descriptor = this.registeredDescriptors.find((c) => c.contextId === contextId);
        return descriptor;
    }

    public static async getContextForUrl(
        contextUrl: string, objectId?: string | number, contextMode?: ContextMode
    ): Promise<Context> {
        let context;
        if (!contextMode) {
            contextMode = ContextMode.DASHBOARD;

            if (objectId) {
                contextMode = ContextMode.DETAILS;
            }
        }

        context = this.getInstance().contextInstances.find(
            (c) => this.isDescriptorForUrl(c.getDescriptor(), contextMode, contextUrl)
        );

        if (!context) {
            const descriptor = this.getInstance().registeredDescriptors.find(
                (cd) => this.isDescriptorForUrl(cd, contextMode, contextUrl)
            );

            if (descriptor) {
                context = this.getInstance().createContextInstance(descriptor.contextId);
            }
        }

        return context;
    }

    private async createContextInstance(
        contextId: string, objectType?: KIXObjectType, contextMode?: ContextMode, objectId?: string | number
    ): Promise<Context> {
        const promiseKey = JSON.stringify({ contextId, kixObjectType: objectType, contextMode, objectId });
        if (!this.contextCreatePromises.has(promiseKey)) {
            this.contextCreatePromises.set(
                promiseKey, this.createPromise(contextId, objectType, contextMode, objectId)
            );
        }

        const contextPromise = this.contextCreatePromises.get(promiseKey);
        const newContext = await contextPromise.catch(() => null);

        if (newContext) {
            this.contextInstances.push(newContext);
        }

        this.contextCreatePromises.delete(promiseKey);
        return newContext;
    }

    private createPromise(
        contextId: string, objectType: KIXObjectType, contextMode: ContextMode, objectId?: string | number
    ): Promise<Context> {
        return new Promise<Context>(async (resolve, reject) => {
            const descriptor = this.registeredDescriptors.find(
                (cd) => this.isContext(contextId, cd, objectType, contextMode)
            );

            let context: Context;
            if (descriptor) {
                const configuration = await ContextSocketClient.loadContextConfiguration(descriptor.contextId);
                context = new descriptor.contextClass(descriptor, objectId, configuration);
                await context.initContext();
            }

            resolve(context);
        });
    }

    public resetDialogContexts(): void {
        this.contextInstances.filter((c) => c.getDescriptor().contextType === ContextType.DIALOG)
            .forEach((c) => {
                c.reset();
                c.resetAdditionalInformation();
            });
    }

    private isContext(
        contextId: string, descriptor: ContextDescriptor, objectType: KIXObjectType, contextMode: ContextMode
    ): boolean {
        return descriptor.contextId === contextId ||
            (descriptor.isContextFor(objectType) && descriptor.contextMode === contextMode);
    }

    private static isDescriptorForUrl(
        descriptor: ContextDescriptor, contextMode: ContextMode, contextUrl: string
    ): boolean {
        return descriptor.contextMode === contextMode && descriptor.urlPaths.some((u) => u === contextUrl);
    }

}
