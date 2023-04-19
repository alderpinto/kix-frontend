/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../model/kix/KIXObject';
import { KIXObjectType } from '../../model/kix/KIXObjectType';

export interface IObjectFactory<T extends KIXObject = any> {

    isFactoryFor(objectType: KIXObjectType | string): boolean;

    create(object?: T, token?: string): Promise<T>;

    applyPermissions(token: string, object: T): Promise<T>;

}
