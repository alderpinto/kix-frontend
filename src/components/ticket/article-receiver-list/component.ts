/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ArticleReceiver } from '../../../core/model';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.receiverList = input.receiver;
    }

    public getReceiverString(receiver: ArticleReceiver): string {
        const email = receiver.email;
        const realName = receiver.realName;
        return realName === email ? email : `${realName} ${email}`;
    }

}

module.exports = Component;
