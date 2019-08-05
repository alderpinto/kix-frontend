/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IWidgetContent } from "./IWidgetContent";
import { KIXObject } from "../..";

export class StringContent<T extends KIXObject<T>> implements IWidgetContent<T> {

    public constructor(private value: string, private actionObject?: T) { }

    public getValue(): string {
        return this.value;
    }

    public getActionObject(): T {
        return this.actionObject;
    }
}
