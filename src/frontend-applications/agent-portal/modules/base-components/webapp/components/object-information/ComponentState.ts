/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../../../../../model/kix/KIXObject";
import { ILabelProvider } from "../../../../../modules/base-components/webapp/core/ILabelProvider";

export class ComponentState {

    public constructor(
        public object: KIXObject = null,
        public flat: boolean = false,
        public properties: string[] = [],
        public labelProvider: ILabelProvider<KIXObject> = null,
        public prepared: boolean = false
    ) { }

}
