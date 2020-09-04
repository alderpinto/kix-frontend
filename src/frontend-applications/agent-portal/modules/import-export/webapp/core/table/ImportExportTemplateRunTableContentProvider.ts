/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../base-components/webapp/core/table/TableContentProvider';
import { Table, RowObject } from '../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ImportExportTemplateRun } from '../../../model/ImportExportTemplateRun';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

export class ImportExportTemplateRunTableContentProvider extends TableContentProvider<ImportExportTemplateRun> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<ImportExportTemplateRun>>> {
        let objects = [];
        // first object id is template id
        if (this.contextId && this.objectIds && this.objectIds[0]) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            objects = context ? await context.getObjectList('RUNS_OF_TEMPLATE_' + this.objectIds[0]) : [];
        }
        return await this.getRowObjects(objects);
    }
}
