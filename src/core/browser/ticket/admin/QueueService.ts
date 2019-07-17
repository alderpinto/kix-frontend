import { KIXObjectService } from "../../kix";
import {
    KIXObjectType, KIXObjectSpecificLoadingOptions, KIXObjectLoadingOptions, KIXObject, Queue,
    TreeNode, ObjectIcon, FilterCriteria, FilterDataType, FilterType, QueueProperty,
    FollowUpType, TreeNodeProperty, SysConfigOption, SysConfigKey
} from "../../../model";
import { SearchOperator } from "../../SearchOperator";
import { LabelService } from "../../LabelService";
import { TranslationService } from "../../i18n/TranslationService";

export class QueueService extends KIXObjectService<Queue> {

    private static INSTANCE: QueueService = null;

    public static getInstance(): QueueService {
        if (!QueueService.INSTANCE) {
            QueueService.INSTANCE = new QueueService();
        }

        return QueueService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.QUEUE
            || kixObjectType === KIXObjectType.FOLLOW_UP_TYPE;
    }

    public getLinkObjectName(): string {
        return 'Queue';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.FOLLOW_UP_TYPE) {
            objects = await super.loadObjects<O>(KIXObjectType.FOLLOW_UP_TYPE, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case QueueProperty.FOLLOW_UP_LOCK:
                value = Number(value);
                break;
            default:
        }
        return [[property, value]];
    }

    public async prepareObjectTree(
        queues: Queue[], showInvalid?: boolean, filterIds?: number[], includeTicketStats: boolean = false
    ): Promise<TreeNode[]> {
        const nodes = [];
        if (queues && !!queues.length) {
            if (!showInvalid) {
                queues = queues.filter((q) => q.ValidID === 1);
            }

            if (filterIds && filterIds.length) {
                queues = queues.filter((q) => !filterIds.some((fid) => fid === q.QueueID));
            }

            for (const queue of queues) {
                let ticketStats = null;
                if (includeTicketStats) {
                    ticketStats = await this.getTicketStats(queue);
                }

                const subTree = await this.prepareObjectTree(
                    queue.SubQueues, showInvalid, filterIds, includeTicketStats
                );
                const treeNode = new TreeNode(
                    queue.QueueID, queue.Name,
                    new ObjectIcon(KIXObjectType.QUEUE, queue.QueueID),
                    null,
                    subTree,
                    null, null, null,
                    ticketStats,
                    null, null, null, queue.ValidID === 1 ? true : false
                );
                nodes.push(treeNode);
            }
        }
        return nodes;
    }

    private async getTicketStats(queue: Queue): Promise<TreeNodeProperty[]> {
        const properties: TreeNodeProperty[] = [];
        if (queue.TicketStats) {
            const totalCount = queue.TicketStats.TotalCount;
            const totalTooltip = await TranslationService.translate('Translatable#All tickets', [totalCount]);

            const freeCount = totalCount - queue.TicketStats.LockCount;
            const freeTooltip = await TranslationService.translate(
                'Translatable#All free tickets', [totalCount - freeCount]
            );

            properties.push(new TreeNodeProperty(freeCount, freeTooltip));
            properties.push(new TreeNodeProperty(totalCount, totalTooltip));
        }

        return properties;
    }

    public async getQueuesHierarchy(): Promise<Queue[]> {
        const viewableStateTypes = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_VIEWABLE_STATE_TYPE]
        );

        const stateTypes = viewableStateTypes && viewableStateTypes.length ? viewableStateTypes[0].Value : [];

        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null
                )
            ],
            null, null,
            [QueueProperty.SUB_QUEUES, 'TicketStats', 'Tickets'],
            [QueueProperty.SUB_QUEUES],
            [["TicketStats.StateType", stateTypes.join(',')]]
        );

        return await KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE, null, loadingOptions);
    }

    public async getTreeNodes(property: string, showInvalid?: boolean): Promise<TreeNode[]> {
        const values: TreeNode[] = [];

        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.QUEUE);

        switch (property) {
            case QueueProperty.FOLLOW_UP_ID:
                let followUpTypes = await KIXObjectService.loadObjects<FollowUpType>(KIXObjectType.FOLLOW_UP_TYPE);
                if (!showInvalid) {
                    followUpTypes = followUpTypes.filter((q) => q.ValidID === 1);
                }
                for (const type of followUpTypes) {
                    const icons = await labelProvider.getIcons(null, property, type.ID);
                    values.push(new TreeNode(type.ID, type.Name, (icons && icons.length) ? icons[0] : null));
                }
                break;
            default:
        }

        return values;
    }
}
