import {
    DateTimeUtil, ObjectIcon, KIXObjectType, SysConfigOption, SysConfigKey, ValidObject
} from "../../model";
import { FAQArticleProperty, FAQArticle, FAQCategory } from "../../model/kix/faq";
import { KIXObjectService, ServiceRegistry } from "../kix";
import { BrowserUtil } from "../BrowserUtil";
import { SearchProperty } from "../SearchProperty";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";

export class FAQLabelProvider extends LabelProvider<FAQArticle> {

    public kixObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case FAQArticleProperty.CATEGORY_ID:
                const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(KIXObjectType.FAQ_CATEGORY);
                const category = faqCategories.find((fc) => fc.ID === value);
                displayValue = category ? category.Name : value;
                break;
            case FAQArticleProperty.VALID_ID:
                const validObjects = await KIXObjectService.loadObjects<ValidObject>(KIXObjectType.VALID_OBJECT);
                const valid = validObjects.find((v) => v.ID === value);
                displayValue = valid ? valid.Name : value;
                break;
            default:
                displayValue = value;
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SearchProperty.FULLTEXT:
                displayValue = 'Translatable#Full Text';
                break;
            case FAQArticleProperty.APPROVED:
                displayValue = 'Translatable#Approved';
                break;
            case FAQArticleProperty.ATTACHMENTS:
                displayValue = 'Translatable#Attachments';
                break;
            case FAQArticleProperty.CATEGORY_ID:
                displayValue = 'Translatable#Category';
                break;
            case FAQArticleProperty.CHANGED:
                displayValue = 'Translatable#Changed at';
                break;
            case FAQArticleProperty.CHANGED_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case FAQArticleProperty.CREATED:
                displayValue = 'Translatable#Created at';
                break;
            case FAQArticleProperty.CREATED_BY:
                displayValue = 'Translatable#Created by';
                break;
            case FAQArticleProperty.FIELD_1:
                displayValue = 'Translatable#Symptom';
                break;
            case FAQArticleProperty.FIELD_2:
                displayValue = 'Translatable#Cause';
                break;
            case FAQArticleProperty.FIELD_3:
                displayValue = 'Translatable#Solution';
                break;
            case FAQArticleProperty.FIELD_6:
                displayValue = 'Translatable#Comment';
                break;
            case FAQArticleProperty.HISTORY:
                displayValue = 'Translatable#History';
                break;
            case FAQArticleProperty.ID:
                displayValue = 'Translatable#Id';
                break;
            case FAQArticleProperty.KEYWORDS:
                displayValue = 'Translatable#Tags';
                break;
            case FAQArticleProperty.LANGUAGE:
                displayValue = 'Translatable#Language';
                break;
            case FAQArticleProperty.LINK:
                displayValue = 'Translatable#Links';
                break;
            case FAQArticleProperty.NUMBER:
                const hookConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.FAQ_HOOK]
                ).catch((error): SysConfigOption[] => []);
                if (hookConfig && hookConfig.length) {
                    displayValue = hookConfig[0].Value;
                }
                break;
            case FAQArticleProperty.TITLE:
                displayValue = 'Translatable#Title';
                break;
            case FAQArticleProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case FAQArticleProperty.VISIBILITY:
                displayValue = 'Translatable#Visibility';
                break;
            case FAQArticleProperty.VOTES:
                displayValue = 'Translatable#Rating';
                break;
            case 'LinkedAs':
                displayValue = 'Translatable#Linked as';
                break;
            default:
                displayValue = property;
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        faqArticle: FAQArticle, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = faqArticle[property];

        switch (property) {
            case FAQArticleProperty.CATEGORY_ID:
                const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(KIXObjectType.FAQ_CATEGORY);
                const category = faqCategories.find((fc) => fc.ID === displayValue);
                displayValue = category ? category.Name : displayValue;
                break;
            case FAQArticleProperty.CREATED:
            case FAQArticleProperty.CHANGED:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case FAQArticleProperty.VOTES:
                displayValue = '';
                if (faqArticle.Votes && faqArticle.Votes.length) {
                    const average = BrowserUtil.calculateAverage(faqArticle.Votes.map((v) => v.Rating));
                    displayValue = `(${average})`;
                }
                break;
            case FAQArticleProperty.CREATED_BY:
                displayValue = faqArticle.createdBy ? faqArticle.createdBy.UserFullname : faqArticle.CreatedBy;
                break;
            case FAQArticleProperty.CHANGED_BY:
                displayValue = faqArticle.changedBy ? faqArticle.changedBy.UserFullname : faqArticle.ChangedBy;
                break;
            case FAQArticleProperty.VALID_ID:
                const validObjects = await KIXObjectService.loadObjects<ValidObject>(KIXObjectType.VALID_OBJECT);
                const valid = validObjects.find((v) => v.ID.toString() === faqArticle.ValidID.toString());
                displayValue = valid ? valid.Name : faqArticle.ValidID;
                break;
            case FAQArticleProperty.LANGUAGE:
                const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                    KIXObjectType.TRANSLATION_PATTERN
                );
                displayValue = await translationService.getLanguageName(faqArticle.Language);
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(faqArticle: FAQArticle): boolean {
        return faqArticle instanceof FAQArticle;
    }

    public async getObjectText(faqArticle: FAQArticle, id: boolean = true, title: boolean = true): Promise<string> {
        let returnString = '';
        if (faqArticle) {
            if (id) {
                let faqHook: string = '';

                const hookConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.FAQ_HOOK]
                ).catch((error): SysConfigOption[] => []);

                if (hookConfig && hookConfig.length) {
                    faqHook = hookConfig[0].Value;
                }

                returnString = `${faqHook}${faqArticle.Number}`;
            }
            if (title) {
                returnString += (id ? " - " : '') + faqArticle.Title;
            }

        } else {
            returnString = await TranslationService.translate('Translatable#FAQ Article');
        }
        return returnString;
    }

    public getObjectIcon(faqArticle: FAQArticle): string | ObjectIcon {
        return 'kix-icon-faq';
    }

    public getObjectTooltip(faqArticle: FAQArticle): string {
        return faqArticle.Title;
    }

    public async getObjectName(): Promise<string> {
        return "FAQ";
    }

    public async getIcons(
        faqArticle: FAQArticle, property: string, value?: number | string
    ): Promise<Array<string | ObjectIcon>> {
        const icons = [];

        if (faqArticle) {
            value = faqArticle[property];
        }

        switch (property) {
            case FAQArticleProperty.VOTES:
                if (faqArticle.Votes && faqArticle.Votes.length) {
                    const average = BrowserUtil.calculateAverage(faqArticle.Votes.map((v) => v.Rating));
                    for (let i = 0; i < Math.floor(average); i++) {
                        icons.push('kix-icon-star-fully');
                    }
                    if ((average % 1) !== 0) {
                        icons.push('kix-icon-star-half');
                    }
                }
                break;
            case FAQArticleProperty.VISIBILITY:
                icons.push(new ObjectIcon(FAQArticleProperty.VISIBILITY, value));
                break;
            default:
        }

        return icons;
    }

}
