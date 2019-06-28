import { ComponentState } from './ComponentState';
import { ContextService } from '../../../core/browser';
import { CMDBContext } from '../../../core/browser/cmdb';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<CMDBContext>(CMDBContext.CONTEXT_ID);
        this.state.contentWidgets = context.getContent();
        if (!context.currentCIClass) {
            context.setCIClass(null);
        }
    }

}

module.exports = Component;
