import { ContextService } from "../../../../core/browser";
import { ComponentState } from "./ComponentState";
import { CompareConfigItemVersionDialogContext } from "../../../../core/browser/cmdb";
import { DialogService } from "../../../../core/browser/components/dialog";
import { TranslationService } from "../../../../core/browser/i18n/TranslationService";
import { KIXModulesService } from "../../../../core/browser/modules";

class Component {

    private state: ComponentState;

    private context: CompareConfigItemVersionDialogContext;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Close window"
        ]);

        this.context = await ContextService.getInstance().getContext<CompareConfigItemVersionDialogContext>(
            CompareConfigItemVersionDialogContext.CONTEXT_ID
        );
        this.state.compareWidget = this.context.getCompareWidget();

        const versions = await this.context.getObjectList();
        if (versions) {
            this.state.title = `Gewählte Versionen (${versions.length})`;
        }
    }

    public async submit(): Promise<void> {
        DialogService.getInstance().closeMainDialog();
    }

    public getCompareWidgetTemplate(instanceId: string): any {
        return KIXModulesService.getComponentTemplate(this.state.compareWidget.configuration.widgetId);
    }

}

module.exports = Component;
