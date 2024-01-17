/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';

export class ContactImportDialogContext extends Context {

    public static CONTEXT_ID: string = 'contact-import-dialog-context';

    public deleteObjectList(objectType: string): void {
        return;
    }

}
