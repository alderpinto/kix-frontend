/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectUpdatedEvent } from './ObjectUpdatedEvent';

export class BackendNotification {

    public RequestID: string;
    public Namespace: string;
    public ObjectID: string;
    public Timestamp: string;
    public Event: ObjectUpdatedEvent;
    public ObjectType: string;

    public constructor(notification?: BackendNotification) {
        if (notification) {
            this.Event = notification.Event;
            this.Namespace = notification.Namespace;
            this.ObjectID = notification.ObjectID;
            this.Timestamp = notification.Timestamp;
            this.RequestID = notification.RequestID;
            this.ObjectType = notification.ObjectType;
        }
    }
}