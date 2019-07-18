/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableExportUtil } from "../../table";
import { FAQCategoryProperty } from "../../../model/kix/faq";
import { CSVExportAction } from "../../actions";

export class FAQCategoryCSVExportAction extends CSVExportAction {

    public async run(): Promise<void> {
        if (this.canRun()) {
            TableExportUtil.export(this.data, [FAQCategoryProperty.FULL_NAME]);
        }
    }

}
