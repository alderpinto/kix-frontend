/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketDetailsContext } from '.';
import { SearchOperator, ContextService } from '..';
import {
    Attachment, KIXObjectType, Ticket, TicketProperty, FilterDataType, FilterCriteria, FilterType,
    TreeNode, ObjectIcon, Service, TicketPriority, TicketType,
    TicketState, StateType, KIXObject, Sla, TableFilterCriteria, User, KIXObjectLoadingOptions,
    KIXObjectSpecificLoadingOptions, Article, KIXObjectProperty
} from '../../model';
import { TicketParameterUtil } from './TicketParameterUtil';
import { KIXObjectService } from '../kix';
import { SearchProperty } from '../SearchProperty';
import { LabelService } from '../LabelService';
import { TicketSocketClient } from './TicketSocketClient';
import { AgentService } from '../application/AgentService';
import { QueueService } from './admin';
import { InlineContent } from '../components';

export class TicketService extends KIXObjectService<Ticket> {

    private static INSTANCE: TicketService = null;

    public static getInstance(): TicketService {
        if (!TicketService.INSTANCE) {
            TicketService.INSTANCE = new TicketService();
        }

        return TicketService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET
            || kixObjectType === KIXObjectType.ARTICLE
            || kixObjectType === KIXObjectType.SENDER_TYPE
            || kixObjectType === KIXObjectType.LOCK
            || kixObjectType === KIXObjectType.WATCHER;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.SENDER_TYPE) {
            objects = await super.loadObjects<O>(KIXObjectType.SENDER_TYPE, null, loadingOptions);
        } else if (objectType === KIXObjectType.LOCK) {
            objects = await super.loadObjects<O>(KIXObjectType.LOCK, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public getLinkObjectName(): string {
        return "Ticket";
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        return await TicketParameterUtil.prepareValue(property, value);
    }

    protected async prepareUpdateValue(property: string, value: any): Promise<Array<[string, any]>> {
        return await TicketParameterUtil.prepareValue(property, value, true);
    }

    protected async preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>> {
        return await TicketParameterUtil.getPredefinedParameter(forUpdate);
    }

    public async loadArticleAttachment(ticketId: number, articleId: number, attachmentId: number): Promise<Attachment> {
        const attachment = await TicketSocketClient.getInstance().loadArticleAttachment(
            ticketId, articleId, attachmentId
        );
        return attachment;
    }

    public async loadArticleZipAttachment(ticketId: number, articleId: number): Promise<Attachment> {
        const attachment = await TicketSocketClient.getInstance().loadArticleZipAttachment(
            ticketId, articleId
        );
        return attachment;
    }

    public async setArticleSeenFlag(ticketId: number, articleId: number): Promise<void> {
        await TicketSocketClient.getInstance().setArticleSeenFlag(ticketId, articleId);
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        return [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET);

        switch (property) {
            case TicketProperty.QUEUE_ID:
                const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy();
                nodes = await QueueService.getInstance().prepareObjectTree(
                    queuesHierarchy, showInvalid, filterIds ? filterIds.map((fid) => Number(fid)) : null
                );
                break;
            case TicketProperty.SERVICE_ID:
                const servicesHierarchy = await this.getServicesHierarchy();
                nodes = servicesHierarchy ? this.prepareServiceTree(servicesHierarchy) : [];
                break;
            case TicketProperty.TYPE_ID:
                let types = await KIXObjectService.loadObjects<TicketType>(KIXObjectType.TICKET_TYPE);
                if (!showInvalid) {
                    types = types.filter((t) => t.ValidID === 1);
                }
                for (const t of types) {
                    const icons = await labelProvider.getIcons(null, property, t.ID);
                    nodes.push(new TreeNode(t.ID, t.Name, (icons && icons.length) ? icons[0] : null));
                }
                break;
            case TicketProperty.PRIORITY_ID:
                let priorities = await KIXObjectService.loadObjects<TicketPriority>(KIXObjectType.TICKET_PRIORITY);
                if (!showInvalid) {
                    priorities = priorities.filter((p) => p.ValidID === 1);
                }
                for (const p of priorities) {
                    const icons = await labelProvider.getIcons(null, property, p.ID);
                    nodes.push(new TreeNode(p.ID, p.Name, (icons && icons.length) ? icons[0] : null));
                }
                break;
            case TicketProperty.STATE_ID:
                let states = await KIXObjectService.loadObjects<TicketState>(KIXObjectType.TICKET_STATE);
                if (!showInvalid) {
                    states = states.filter((s) => s.ValidID === 1);
                }
                for (const s of states) {
                    const icons = await labelProvider.getIcons(null, property, s.ID);
                    nodes.push(new TreeNode(s.ID, s.Name, (icons && icons.length) ? icons[0] : null));
                }
                break;
            case TicketProperty.SLA_ID:
                const slas = await KIXObjectService.loadObjects<Sla>(KIXObjectType.SLA);
                slas.forEach((s) => nodes.push(new TreeNode(s.SLAID, s.Name, null)));
                break;
            case TicketProperty.LOCK_ID:
                nodes.push(new TreeNode(1, 'Translatable#Unlocked', 'kix-icon-lock-open'));
                nodes.push(new TreeNode(2, 'Translatable#Locked', 'kix-icon-lock-close'));
                break;
            case TicketProperty.RESPONSIBLE_ID:
            case TicketProperty.OWNER_ID:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, null, null, null, true
                ).catch((error) => [] as User[]);
                users.forEach((u) => nodes.push(new TreeNode(u.UserID, u.UserFullname, 'kix-icon-man')));
                break;
            default:
                nodes = await super.getTreeNodes(property, showInvalid, filterIds);
        }

        return nodes;
    }

    private prepareServiceTree(services: Service[]): TreeNode[] {
        let nodes = [];
        if (services) {
            nodes = services.filter((s) => s.ValidID === 1).map((service: Service) => {
                return new TreeNode(
                    service.ServiceID, service.Name,
                    new ObjectIcon(TicketProperty.SERVICE_ID, service.ServiceID),
                    new ObjectIcon('CurInciStateID', service.IncidentState.CurInciStateID),
                    this.prepareServiceTree(service.SubServices)
                );
            });
        }
        return nodes;
    }

    public async checkFilterValue(ticket: Ticket, criteria: TableFilterCriteria): Promise<boolean> {
        if (criteria.property === TicketProperty.WATCHERS && ticket.Watchers) {
            let value = criteria.value;
            if (criteria.value === KIXObjectType.CURRENT_USER) {
                const currentUser = await AgentService.getInstance().getCurrentUser();
                value = currentUser.UserID;
            }
            return ticket.Watchers.some((w) => w.UserID === value);
        }
        return true;
    }

    public determineDependendObjects(tickets: Ticket[], targetObjectType: KIXObjectType): string[] | number[] {
        let ids = [];

        if (targetObjectType === KIXObjectType.CONTACT) {
            tickets.forEach((t) => {
                if (!ids.some((cid) => cid === t.ContactID)) {
                    ids.push(t.ContactID);
                }
            });
        } else if (targetObjectType === KIXObjectType.ORGANISATION) {
            tickets.forEach((t) => {
                if (!ids.some((cid) => cid === t.OrganisationID)) {
                    ids.push(t.OrganisationID);
                }
            });
        } else if (targetObjectType === KIXObjectType.CONFIG_ITEM) {
            ids = this.getLinkedObjectIds(tickets, KIXObjectType.CONFIG_ITEM);
        } else {
            ids = super.determineDependendObjects(tickets, targetObjectType);
        }

        return ids;
    }

    public async hasPendingState(ticket: Ticket): Promise<boolean> {
        return this.isPendingState(ticket.StateID);
    }

    public async isPendingState(stateId: number): Promise<boolean> {
        let pending = false;

        const states = await KIXObjectService.loadObjects<TicketState>(
            KIXObjectType.TICKET_STATE, [stateId]
        );

        if (states && states.length) {
            const stateTypes = await KIXObjectService.loadObjects<StateType>(
                KIXObjectType.TICKET_STATE_TYPE, null
            );
            const stateType = stateTypes.find((t) => t.ID === states[0].TypeID);

            if (stateType && stateType.Name.toLocaleLowerCase().indexOf('pending') >= 0) {
                pending = true;
            }
        }

        return pending;
    }

    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        const id = object ? object.ObjectId : objectId;
        const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
        return context.getDescriptor().urlPaths[0] + '/' + id;
    }

    public async getServicesHierarchy(): Promise<Service[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria('ParentID', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null)
        ], null, null, ['SubServices', 'IncidentState'], ['SubServices']);

        return await KIXObjectService.loadObjects<Service>(KIXObjectType.SERVICE, null, loadingOptions);
    }

    public async getPreparedArticleBodyContent(article: Article): Promise<[string, InlineContent[]]> {
        if (article.bodyAttachment) {

            const AttachmentWithContent = await this.loadArticleAttachment(
                article.TicketID, article.ArticleID, article.bodyAttachment.ID
            );

            const inlineAttachments = article.Attachments.filter((a) => a.Disposition === 'inline');
            for (const inlineAttachment of inlineAttachments) {
                const attachment = await this.loadArticleAttachment(
                    article.TicketID, article.ArticleID, inlineAttachment.ID
                );
                if (attachment) {
                    inlineAttachment.Content = attachment.Content;
                }
            }

            const inlineContent: InlineContent[] = [];
            inlineAttachments.forEach(
                (a) => inlineContent.push(new InlineContent(a.ContentID, a.Content, a.ContentType))
            );
            return [new Buffer(AttachmentWithContent.Content, 'base64').toString('utf8'), inlineContent];
        } else {
            return [article.Body, null];
        }
    }

    protected getResource(objectType: KIXObjectType): string {
        if (objectType === KIXObjectType.TICKET) {
            return 'tickets';
        } else {
            return super.getResource(objectType);
        }
    }
}
