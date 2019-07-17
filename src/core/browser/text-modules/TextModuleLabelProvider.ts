import { TextModule, KIXObjectType, TextModuleProperty, ObjectIcon } from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";

export class TextModuleLabelProvider extends LabelProvider<TextModule> {

    public kixObjectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public isLabelProviderFor(textModule: TextModule): boolean {
        return textModule instanceof TextModule;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TextModuleProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case TextModuleProperty.LANGUAGE:
                displayValue = 'Translatable#Language';
                break;
            case TextModuleProperty.KEYWORDS:
                displayValue = 'Translatable#Tags';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        textModule: TextModule, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = textModule[property];

        switch (property) {
            case TextModuleProperty.ID:
                displayValue = textModule.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getObjectText(
        textModule: TextModule, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${textModule.Name}`;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Text Modules' : 'Translatable#Text Module'
            );
        }
        return plural ? 'Text Modules' : 'Text Module';
    }

    public getObjectTooltip(textModule: TextModule): string {
        return textModule.Name;
    }

}
