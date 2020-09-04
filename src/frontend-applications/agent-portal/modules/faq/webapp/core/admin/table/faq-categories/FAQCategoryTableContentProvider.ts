/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../../base-components/webapp/core/table/TableContentProvider';
import { FAQCategory } from '../../../../../model/FAQCategory';
import { Table, RowObject, TableValue } from '../../../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';

export class FAQCategoryTableContentProvider extends TableContentProvider<FAQCategory> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.FAQ_CATEGORY, table, objectIds, loadingOptions, contextId);
    }

    protected hasChildRows(rowObject: RowObject<FAQCategory>): boolean {
        return rowObject && rowObject.getObject().SubCategories && rowObject.getObject().SubCategories.length !== 0;
    }

    protected async addChildRows(
        rowObject: RowObject<FAQCategory>
    ): Promise<void> {
        const rows = await this.getRowObjects(rowObject.getObject().SubCategories);
        rows.forEach((r) => rowObject.addChild(r));
    }

}
