import { ComponentState } from './ComponentState';
import { ContextService, IdService } from '../../../../core/browser';
import { TreeNode, Queue, TreeNodeProperty } from '../../../../core/model';
import { TicketContext, QueueService } from '../../../../core/browser/ticket';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

export class Component {

    private state: ComponentState;

    public listenerId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('search-result-explorer-');
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketContext>(TicketContext.CONTEXT_ID);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        await this.loadQueues(context);
    }

    private async loadQueues(context: TicketContext): Promise<void> {
        this.state.nodes = null;
        const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy();
        this.state.nodes = await QueueService.getInstance().prepareObjectTree(queuesHierarchy, false, null, true);
        this.setActiveNode(context.queueId);
    }

    private setActiveNode(queueId: number): void {
        if (queueId) {
            this.activeNodeChanged(this.getActiveNode(queueId));
        } else {
            this.showAll();
        }
    }

    private getActiveNode(queueId: number, nodes: TreeNode[] = this.state.nodes): TreeNode {
        let activeNode = nodes.find((n) => n.id === queueId);
        if (!activeNode) {
            for (let index = 0; index < nodes.length; index++) {
                activeNode = this.getActiveNode(queueId, nodes[index].children);
                if (activeNode) {
                    nodes[index].expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;

        const context = await ContextService.getInstance().getContext<TicketContext>(TicketContext.CONTEXT_ID);
        context.setQueue(node.id);
        context.setAdditionalInformation('STRUCTURE', this.getStructureInformation());
    }

    private getStructureInformation(node: TreeNode = this.state.activeNode): string[] {
        const queue = (node.id as Queue);
        let info = [queue.Name];

        if (node.parent) {
            info = [...this.getStructureInformation(node.parent), ...info];
        }

        return info;
    }

    public async showAll(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketContext>(TicketContext.CONTEXT_ID);
        this.state.activeNode = null;

        const allText = await TranslationService.translate('Translatable#All');

        context.setQueue(null);
        context.setAdditionalInformation('STRUCTURE', [allText]);
    }

}

module.exports = Component;
