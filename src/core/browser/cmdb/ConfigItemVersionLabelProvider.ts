/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Version, DateTimeUtil, KIXObjectType, VersionProperty } from '../../model';
import { TranslationService } from '../i18n/TranslationService';
import { LabelProvider } from '../LabelProvider';

export class ConfigItemVersionLabelProvider extends LabelProvider<Version> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION;

    public isLabelProviderFor(object: Version) {
        return object instanceof Version;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;

        switch (property) {
            case VersionProperty.CURRENT:
                displayValue = value ? 'Translatable#(Current version)' : '';
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case VersionProperty.COUNT_NUMBER:
                displayValue = 'Translatable#No.';
                break;
            case VersionProperty.CURRENT:
                displayValue = 'Translatable#Current version';
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

    public async getDisplayText(
        version: Version, property: string, value?: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = version[property];

        switch (property) {
            case VersionProperty.CREATE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case VersionProperty.CURRENT:
                displayValue = version.isCurrentVersion ? 'Translatable#(current version)' : '';
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(
                    property, displayValue ? displayValue : value, translatable
                );
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getObjectName(): Promise<string> {
        return 'Config Item Version';
    }

}
