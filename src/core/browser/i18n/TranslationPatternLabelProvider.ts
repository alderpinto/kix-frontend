import {
    TranslationPattern, KIXObjectType, ObjectIcon, TranslationPatternProperty, DateTimeUtil, User
} from "../../model";
import { TranslationService } from "./TranslationService";
import { KIXObjectService } from "../kix";
import { LabelProvider } from "../LabelProvider";

export class TranslationPatternLabelProvider extends LabelProvider<TranslationPattern> {

    public kixObjectType: KIXObjectType = KIXObjectType.TRANSLATION_PATTERN;

    public isLabelProviderFor(translation: TranslationPattern): boolean {
        return translation instanceof TranslationPattern;
    }

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;

        switch (property) {
            case TranslationPatternProperty.VALUE:
                displayValue = 'Translatable#Pattern';
                break;
            case TranslationPatternProperty.LANGUAGES:
            case TranslationPatternProperty.AVAILABLE_LANGUAGES:
                displayValue = 'Translatable#Languages';
                break;
            case TranslationPatternProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case TranslationPatternProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case TranslationPatternProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case TranslationPatternProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getDisplayText(
        translation: TranslationPattern, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = translation[property];

        switch (property) {
            case TranslationPatternProperty.VALUE:
                displayValue = translation.Value;
                break;
            case TranslationPatternProperty.AVAILABLE_LANGUAGES:
                displayValue = translation.AvailableLanguages.map((l) => l).join(', ');
                break;
            case TranslationPatternProperty.CREATE_BY:
            case TranslationPatternProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case TranslationPatternProperty.CREATE_TIME:
            case TranslationPatternProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return value.toString();
    }

    public getDisplayTextClasses(translation: TranslationPattern, property: string): string[] {
        return [];
    }

    public getObjectClasses(translation: TranslationPattern): string[] {
        return [];
    }

    public async getObjectText(
        translation: TranslationPattern, id?: boolean, title?: boolean, translatable: boolean = true
    ): Promise<string> {
        let displayValue = 'Translatable#Translation';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }
        return `${displayValue}: ${translation.Value}`;
    }

    public getObjectAdditionalText(translation: TranslationPattern): string {
        return translation.Value;
    }

    public getObjectIcon(translation?: TranslationPattern): string | ObjectIcon {
        return new ObjectIcon('Translation', translation.ObjectId);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = plural ? 'Translations' : 'Translation';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }
        return displayValue;
    }

    public getObjectTooltip(translation: TranslationPattern): string {
        return translation.ObjectId.toString();
    }

    public async getIcons(
        translation: TranslationPattern, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === 'ICON') {
            return [new ObjectIcon('Translation', translation.ObjectId)];
        }
        return null;
    }

}
