/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../../base-components/webapp/core/table/TableContentProvider";
import { Article } from "../../../../model/Article";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../../model/kix/KIXObjectType";
import { ContextService } from "../../../../../../modules/base-components/webapp/core/ContextService";
import { Ticket } from "../../../../model/Ticket";
import { ArticleProperty } from "../../../../model/ArticleProperty";

export class ArticleTableContentProvider extends TableContentProvider<Article> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.FAQ_ARTICLE, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<Article>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const ticket = await context.getObject<Ticket>();
            if (ticket) {
                rowObjects = ticket.Articles
                    .sort((a, b) => b.ArticleID - a.ArticleID)
                    .map((a, i) => {
                        const values: TableValue[] = [];

                        for (const property in a) {
                            if (a.hasOwnProperty(property)) {
                                values.push(new TableValue(property, a[property]));
                            }
                        }

                        const count = ticket.Articles.length - i;
                        values.push(new TableValue(ArticleProperty.NUMBER, count, count.toString()));
                        values.push(new TableValue(ArticleProperty.ARTICLE_INFORMATION, null));
                        return new RowObject<Article>(values, a);
                    });
            }
        }

        return rowObjects;
    }
}
