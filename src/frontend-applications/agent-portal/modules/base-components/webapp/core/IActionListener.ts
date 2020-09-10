/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Table } from './table';
import { KIXObject } from '../../../../model/kix/KIXObject';

export interface IActionListener {

    listenerInstanceId: string;

    actionDataChanged(data?: KIXObject[] | Table): void;

    actionsChanged(): void;

}
