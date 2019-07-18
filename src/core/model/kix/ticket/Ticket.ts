/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Article, TicketHistory } from '.';
import { KIXObjectType } from '..';
import { KIXObject } from '../KIXObject';
import { Watcher } from './Watcher';
import { DynamicField } from '../dynamic-field';
import { SortUtil, SortOrder } from '../../sort';
import { ArticleProperty } from './ArticleProperty';
import { DataType } from '../../DataType';

export class Ticket extends KIXObject<Ticket> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET;

    public TicketNumber: string;

    public Title: string;

    public TicketID: number;

    public Age: number;

    public Created: string;

    public CreateTimeUnix: number;

    public CreateBy: number;

    public Changed: string;

    public ChangeBy: number;

    public ArchiveFlag: string;

    public PendingTime: string;

    public TimeUnits: number;

    public EscalationResponseTime: number;

    public EscalationUpdateTime: number;

    public EscalationSolutionTime: number;

    public EscalationDestinationIn: string;

    public EscalationDestinationTime: number;

    public EscalationDestinationDate: string;

    public EscalationTimeWorkingTime: number;

    public EscalationTime: number;

    public FirstResponseTimeEscalation: boolean;

    public FirstResponseTimeNotification: boolean;

    public FirstResponseTimeDestinationTime: number;

    public FirstResponseTimeDestinationDate: string;

    public FirstResponseTimeWorkingTime: number;

    public FirstResponseTime: number;

    public UpdateTimeEscalation: boolean;

    public UpdateTimeNotification: boolean;

    public UpdateTimeDestinationTime: number;

    public UpdateTimeDestinationDate: string;

    public UpdateTimeWorkingTime: number;

    public UpdateTime: number;

    public SolutionTimeEscalation: boolean;

    public SolutionTimeNotification: boolean;

    public SolutionTimeDestinationTime: number;

    public SolutionTimeDestinationDate: string;

    public SolutionTimeWorkingTime: number;

    public SolutionTime: number;

    public DynamicFields: DynamicField[];

    public Unseen: number;

    // Object References

    public StateID: number;

    public PriorityID: number;

    public LockID: number;

    public QueueID: number;

    public OrganisationID: string;

    public ContactID: string;

    public OwnerID: number;

    public TypeID: number;

    public SLAID?: number | string;

    public ServiceID?: number;

    public ResponsibleID: number;

    public Articles: Article[];

    public History: TicketHistory[];

    public Watchers: Watcher[];

    public constructor(ticket?: Ticket) {
        super(ticket);
        if (ticket) {
            this.TicketID = Number(ticket.TicketID);
            this.ObjectId = this.TicketID;
            this.TicketNumber = ticket.TicketNumber;
            this.Title = ticket.Title;
            this.StateID = ticket.StateID;
            this.PriorityID = ticket.PriorityID;
            this.LockID = ticket.LockID;
            this.QueueID = ticket.QueueID;
            this.OrganisationID = ticket.OrganisationID;
            this.ContactID = ticket.ContactID;
            this.OwnerID = ticket.OwnerID;
            this.TypeID = ticket.TypeID;

            this.SLAID = String(ticket.SLAID) === ''
                ? null
                : (ticket.SLAID !== null ? Number(ticket.SLAID) : null);

            this.ServiceID = String(ticket.ServiceID) === ''
                ? null
                : (ticket.ServiceID !== null ? Number(ticket.ServiceID) : null);

            this.ResponsibleID = ticket.ResponsibleID;
            this.Age = ticket.Age;
            this.Created = ticket.Created;
            this.CreateTimeUnix = ticket.CreateTimeUnix;
            this.Changed = ticket.Changed;
            this.ArchiveFlag = ticket.ArchiveFlag;
            this.PendingTime = ticket.PendingTime;
            this.TimeUnits = ticket.TimeUnits;
            this.EscalationResponseTime = ticket.EscalationResponseTime;
            this.EscalationUpdateTime = ticket.EscalationUpdateTime;
            this.EscalationSolutionTime = ticket.EscalationSolutionTime;
            this.EscalationDestinationIn = ticket.EscalationDestinationIn;
            this.EscalationDestinationTime = ticket.EscalationDestinationTime;
            this.EscalationDestinationDate = ticket.EscalationDestinationDate;
            this.EscalationTimeWorkingTime = ticket.EscalationTimeWorkingTime;
            this.EscalationTime = ticket.EscalationTime;
            this.FirstResponseTimeEscalation = ticket.FirstResponseTimeNotification;
            this.FirstResponseTimeNotification = ticket.FirstResponseTimeNotification;
            this.FirstResponseTimeDestinationTime = ticket.FirstResponseTimeDestinationTime;
            this.FirstResponseTimeDestinationDate = ticket.FirstResponseTimeDestinationDate;
            this.FirstResponseTimeWorkingTime = ticket.FirstResponseTimeWorkingTime;
            this.FirstResponseTime = ticket.FirstResponseTime;
            this.UpdateTimeEscalation = ticket.UpdateTimeEscalation;
            this.UpdateTimeNotification = ticket.UpdateTimeNotification;
            this.UpdateTimeDestinationTime = ticket.UpdateTimeDestinationTime;
            this.UpdateTimeDestinationDate = ticket.UpdateTimeDestinationDate;
            this.UpdateTimeWorkingTime = ticket.UpdateTimeWorkingTime;
            this.UpdateTime = ticket.UpdateTime;
            this.SolutionTimeEscalation = ticket.SolutionTimeEscalation;
            this.SolutionTimeNotification = ticket.SolutionTimeNotification;
            this.SolutionTimeDestinationTime = ticket.SolutionTimeDestinationTime;
            this.SolutionTimeDestinationDate = ticket.SolutionTimeDestinationDate;
            this.SolutionTimeWorkingTime = ticket.SolutionTimeWorkingTime;
            this.SolutionTime = ticket.SolutionTime;

            this.LinkTypeName = ticket.LinkTypeName;
            this.Watchers = ticket.Watchers;
            this.Unseen = Number(ticket.Unseen);

            this.Articles = ticket.Articles;
            this.Links = ticket.Links;
            this.DynamicFields = ticket.DynamicFields;
            this.History = ticket.History;
        }

    }

    public isPendingReached(): boolean {
        const pendingTimeInMillis = Date.parse(this.PendingTime);
        const now = Date.now();
        return now > pendingTimeInMillis;
    }

    public getFirstArticle(): Article {
        if (this.Articles && this.Articles.length) {
            const sortedArticles = SortUtil.sortObjects(
                this.Articles, ArticleProperty.ARTICLE_ID, DataType.NUMBER, SortOrder.UP
            );
            return sortedArticles[0];
        }

        return null;
    }

    public equals(ticket: Ticket): boolean {
        return this.TicketID === ticket.TicketID;
    }

    public getIdPropertyName(): string {
        return 'TicketID';
    }
}
