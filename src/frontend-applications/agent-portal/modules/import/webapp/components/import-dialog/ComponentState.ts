/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { ImportManager } from '../../core';
import { Table } from '../../../../base-components/webapp/core/table';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = null,
        public importManager: ImportManager = null,
        public table: Table = null,
        public tableTitle: string = null,
        public canRun: boolean = false,
        public run: boolean = false,
        public prepared: boolean = false
    ) {
        super();
    }

}
