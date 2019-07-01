import {
    ObjectIcon, KIXObjectType, ConfigItemClassDefinition, ConfigItemClassProperty, DateTimeUtil,
    ConfigItemClassDefinitionProperty, User
} from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { KIXObjectService } from "../kix";
import { LabelProvider } from "../LabelProvider";

export class ConfigItemClassDefinitionLabelProvider extends LabelProvider<ConfigItemClassDefinition> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION;

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ConfigItemClassDefinitionProperty.VERSION:
                displayValue = 'Translatable#Version';
                break;
            case ConfigItemClassProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case ConfigItemClassProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case ConfigItemClassProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case ConfigItemClassDefinitionProperty.CURRENT:
                displayValue = 'Translatable#Current Definition';
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
        ciClassDefinition: ConfigItemClassDefinition, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ciClassDefinition[property];

        switch (property) {
            case ConfigItemClassDefinitionProperty.CREATE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case ConfigItemClassDefinitionProperty.CREATE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [displayValue], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : displayValue;
                break;
            case ConfigItemClassDefinitionProperty.CURRENT:
                displayValue = value ? 'Translatable#(Current definition)' : '';
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public isLabelProviderFor(ciClassDefinition: ConfigItemClassDefinition): boolean {
        return ciClassDefinition instanceof ConfigItemClassDefinition;
    }

    public async getObjectText(
        ciClassDefinition: ConfigItemClassDefinition, id: boolean = true, name: boolean = true,
        translatable: boolean = true
    ): Promise<string> {
        return translatable ? await TranslationService.translate(ciClassDefinition.Class) : ciClassDefinition.Class;
    }

    public getObjectIcon(ciClassDefinition: ConfigItemClassDefinition): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public getObjectTooltip(ciClassDefinition: ConfigItemClassDefinition): string {
        return ciClassDefinition.Class;
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        if (plural) {
            const definitionsLabel = translatable
                ? await TranslationService.translate('Translatable#CI Class Definitions')
                : 'CI Class Definitions';
            return definitionsLabel;
        }

        const definitionLabel = translatable
            ? await TranslationService.translate('Translatable#CI Class Definition')
            : 'CI Class Definition';
        return definitionLabel;
    }
}
