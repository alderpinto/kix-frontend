/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ImportExportTemplate } from "../../model/ImportExportTemplate";

export class ImportExportService extends KIXObjectService<ImportExportTemplate> {

    private static INSTANCE: ImportExportService = null;

    public static getInstance(): ImportExportService {
        if (!ImportExportService.INSTANCE) {
            ImportExportService.INSTANCE = new ImportExportService();
        }

        return ImportExportService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.IMPORT_EXPORT_TEMPLATE;
    }

    public getLinkObjectName(): string {
        return 'ImportExportTemplate';
    }

}
