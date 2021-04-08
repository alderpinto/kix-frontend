/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextMode } from '../../../../model/ContextMode';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { ReportDefinition } from '../../model/ReportDefinition';
import { ReportDefinitionProperty } from '../../model/ReportDefinitionProperty';
import { NewReportDialogContext } from './context/NewReportDialogContext';

export class ReportDefinitionDialogUtil {

    public static async openCreateReportDialog(
        reportDefinition: ReportDefinition, outputFormat?: string
    ): Promise<void> {
        await ContextService.getInstance().setDialogContext(
            NewReportDialogContext.CONTEXT_ID, KIXObjectType.REPORT, ContextMode.CREATE_SUB, null, true, 'Translatable#Create Report', true,
            'kix-icon-kpi', null, null,
            [
                [KIXObjectType.REPORT_DEFINITION, reportDefinition],
                [ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS, outputFormat]
            ]
        );
    }
}