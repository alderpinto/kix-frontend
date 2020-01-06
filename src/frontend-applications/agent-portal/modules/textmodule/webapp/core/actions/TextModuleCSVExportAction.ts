/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableExportUtil } from "../../../../base-components/webapp/core/table";
import { TextModuleProperty } from "../../../model/TextModuleProperty";
import { CSVExportAction } from "../../../../import/webapp/core/actions/CSVExportAction";

export class TextModuleCSVExportAction extends CSVExportAction {

    public hasLink: boolean = false;

    public async run(): Promise<void> {
        if (this.canRun()) {
            TableExportUtil.export(this.data, [TextModuleProperty.TEXT]);
        }
    }

}
