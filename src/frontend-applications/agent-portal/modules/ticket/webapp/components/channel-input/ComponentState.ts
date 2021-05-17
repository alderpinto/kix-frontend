/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from '../../../../../modules/base-components/webapp/core/FormInputComponentState';
import { Channel } from '../../../model/Channel';

export class ComponentState extends FormInputComponentState<number> {

    public constructor(
        public channels: Channel[] = null,
        public currentChannel: Channel = null,
        public channelNames: Array<[number, string]> = [],
        public noChannel: boolean = false,
        public loading: boolean = true
    ) {
        super();
    }

}
