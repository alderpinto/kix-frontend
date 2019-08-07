/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "..";
import { Contact } from "../contact";
import { Ticket } from "../ticket";
import { TicketStats } from "./TicketStats";

export class Organisation extends KIXObject<Organisation> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.ORGANISATION;

    public ID: number;

    public City: string;

    public Comment: string;

    public Country: string;

    public Name: string;

    public Number: string;

    public Street: string;

    public Url: string;

    public Zip: string;

    public Contacts: Contact[];

    public Tickets: Ticket[];

    public TicketStats: TicketStats;

    public constructor(organisation?: Organisation) {
        super(organisation);

        if (organisation) {
            this.ID = organisation.ID;
            this.ObjectId = this.ID;

            this.City = organisation.City;
            this.Comment = organisation.Comment;
            this.Country = organisation.Country;
            this.Name = organisation.Name;
            this.Number = organisation.Number;
            this.Street = organisation.Street;
            this.Url = organisation.Url;
            this.Zip = organisation.Zip;
            this.TicketStats = organisation.TicketStats;

            this.Contacts = organisation.Contacts
                ? organisation.Contacts.map((c) => new Contact(c))
                : [];

            this.Tickets = organisation.Tickets
                ? organisation.Tickets.map((t) => new Ticket(t))
                : [];
        }
    }



}
