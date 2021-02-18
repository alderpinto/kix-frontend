/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import { NotificationEvent } from '../../model/NotificationEvent';

export class NotificationNamespace extends SocketNameSpace {

    private static INSTANCE: NotificationNamespace;

    public static getInstance(): NotificationNamespace {
        if (!NotificationNamespace.INSTANCE) {
            NotificationNamespace.INSTANCE = new NotificationNamespace();
        }
        return NotificationNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'notifications';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        return;
    }

    public broadcast(event: NotificationEvent, content: any): void {
        if (this.namespace) {
            this.namespace.emit(event, content);
        }
    }

}
