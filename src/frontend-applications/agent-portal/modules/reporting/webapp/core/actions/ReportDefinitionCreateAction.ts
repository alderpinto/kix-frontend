/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { ContextMode } from '../../../../../model/ContextMode';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { NewReportDefinitionDialogContext } from '../context/NewReportDefinitionDialogContext';

export class ReportDefinitionCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('reporting/reportdefinitions', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Report Definition';
        this.icon = 'kix-icon-kpi';
    }

    public async run(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewReportDefinitionDialogContext.CONTEXT_ID, KIXObjectType.REPORT_DEFINITION, ContextMode.CREATE,
            null, null, 'Translatable#New Report Definition', true
        );
    }

}
