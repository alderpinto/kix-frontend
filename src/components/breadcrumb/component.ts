import { ContextType, Context, ContextDescriptor } from "../../core/model";
import { IContextServiceListener, ContextService } from "../../core/browser";
import { ComponentState } from './ComponentState';
import { RoutingConfiguration } from "../../core/browser/router";

class BreadcrumbComponent implements IContextServiceListener {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        ContextService.getInstance().registerListener(this);
        this.state.loading = false;
    }

    public contextRegistered(descriptor: ContextDescriptor): void {
        return;
    }

    public async contextChanged(
        newContextId: string, newContext: Context, type: ContextType, history: boolean
    ): Promise<void> {
        if (type === ContextType.MAIN) {
            this.state.loading = true;
            this.state.contexts = [];
            this.state.icon = null;

            const breadcrumbInformation = await newContext.getBreadcrumbInformation();
            this.state.icon = breadcrumbInformation.icon;
            for (const contextId of breadcrumbInformation.contextIds) {
                const context = await ContextService.getInstance().getContext(contextId);
                const displayText = await context.getDisplayText();
                this.state.contexts.push([contextId, displayText]);
            }

            this.state.contexts.push([newContextId, breadcrumbInformation.currentText]);

            newContext.registerListener('kix-breadcrumb', {
                objectChanged: async () => {
                    const displayText = await newContext.getDisplayText();
                    const index = this.state.contexts.findIndex((c) => c[0] === newContextId);
                    if (index !== -1) {
                        this.state.contexts[index][1] = displayText;
                        (this as any).setStateDirty('contexts');
                    }
                },
                objectListChanged: () => { return; },
                explorerBarToggled: () => { return; },
                filteredObjectListChanged: () => { return; },
                sidebarToggled: () => { return; },
                scrollInformationChanged: () => { return; }
            });
            this.state.loading = false;
        }
    }

    public getRoutingConfiguration(contextId: string, index: number): RoutingConfiguration {
        if (index < this.state.contexts.length - 1) {
            return new RoutingConfiguration(contextId, null, null, null);
        }
        return null;
    }

}

module.exports = BreadcrumbComponent;
