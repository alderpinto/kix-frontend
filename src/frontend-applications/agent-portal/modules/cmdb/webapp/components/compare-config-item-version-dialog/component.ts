/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { CompareConfigItemVersionDialogContext } from "../../core";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { DialogService } from "../../../../../modules/base-components/webapp/core/DialogService";
import { KIXModulesService } from "../../../../../modules/base-components/webapp/core/KIXModulesService";

class Component {

    private state: ComponentState;

    private context: CompareConfigItemVersionDialogContext;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Close Dialog"
        ]);

        this.context = await ContextService.getInstance().getContext<CompareConfigItemVersionDialogContext>(
            CompareConfigItemVersionDialogContext.CONTEXT_ID
        );
        this.state.compareWidget = this.context.getWidgetConfiguration('compare-ci-version-widget');

        const versions = await this.context.getObjectList(KIXObjectType.CONFIG_ITEM_VERSION);
        if (versions) {
            const text = await TranslationService.translate('Translatable#Selected Versions', []);
            this.state.title = `${text} (${versions.length})`;
        }
    }

    public async submit(): Promise<void> {
        DialogService.getInstance().closeMainDialog();
    }

    public getCompareWidgetTemplate(instanceId: string): any {
        return KIXModulesService.getComponentTemplate(this.state.compareWidget.widgetId);
    }

}

module.exports = Component;