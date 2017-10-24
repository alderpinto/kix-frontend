import { TicketState, TicketType, User, TicketPriority } from '@kix/core/dist/model/client';
import { TicketCreationSocketListener } from './../socket/TicketCreationSocketListener';

export class TicketCreationProcessReduxState {

    public socketListener: TicketCreationSocketListener;

    public createTicketInProcess: boolean = false;
    public resetTicketCreationInProcess: boolean = false;

    public ticketTemplates: any[] = []; // TODO: template model
    public services: any[] = []; // TODO: services model
    public slas: any[] = []; // TODO: sla model
    public priorities: TicketPriority[] = [];
    public types: TicketType[] = [];
    public states: TicketState[] = [];
    public queues: any[] = []; // TODO: queue model
    public user: User[] = [];

    // Loading triggers
    public loadTicketData: boolean = true;
    public userSearchInProgress: boolean = false;
}
