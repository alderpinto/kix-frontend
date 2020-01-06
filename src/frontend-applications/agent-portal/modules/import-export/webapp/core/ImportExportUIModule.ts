/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { ServiceRegistry } from "../../../base-components/webapp/core/ServiceRegistry";
import { FactoryService } from "../../../base-components/webapp/core/FactoryService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TableFactoryService } from "../../../base-components/webapp/core/table";
import { LabelService } from "../../../base-components/webapp/core/LabelService";
import { ImportExportService } from "./ImportExportService";
import { ImportExportTemplateBrowserFactory } from "./ImportExportTemplateBrowserFactory";
import { ImportExportTemplateLabelProvider } from "./ImportExportTemplateLabelProvider";
import { ActionFactory } from "../../../base-components/webapp/core/ActionFactory";
import { TemplateImportAction, TemplateExportAction } from "./actions";
import { ImportExportTemplateTableFactory, ImportExportTemplateRunTableFactory } from "./table";
import { ImportExportTemplateRunLabelProvider } from "./ImportExportTemplateRunLabelProvider";


export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'ImportExportUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(ImportExportService.getInstance());

        FactoryService.getInstance().registerFactory(
            KIXObjectType.IMPORT_EXPORT_TEMPLATE, ImportExportTemplateBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new ImportExportTemplateTableFactory());
        LabelService.getInstance().registerLabelProvider(new ImportExportTemplateLabelProvider());

        TableFactoryService.getInstance().registerFactory(new ImportExportTemplateRunTableFactory());
        LabelService.getInstance().registerLabelProvider(new ImportExportTemplateRunLabelProvider());

        ActionFactory.getInstance().registerAction('template-import-action', TemplateImportAction);
        ActionFactory.getInstance().registerAction('template-export-action', TemplateExportAction);
    }
}
