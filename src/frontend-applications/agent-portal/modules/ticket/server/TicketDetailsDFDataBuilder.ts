/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFieldValue } from "../../dynamic-fields/model/DynamicFieldValue";
import { DynamicFieldType } from "../../dynamic-fields/model/DynamicFieldType";
import { DynamicField } from "../../dynamic-fields/model/DynamicField";
import { DynamicFieldFormUtil } from "../../base-components/webapp/core/DynamicFieldFormUtil";
import { ConfigItem } from "../../cmdb/model/ConfigItem";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../model/KIXObjectLoadingOptions";
import { ConfigItemProperty } from "../../cmdb/model/ConfigItemProperty";
import { DynamicFieldAPIService } from "../../dynamic-fields/server/DynamicFieldService";
import { DateTimeUtil } from "../../../server/services/DateTimeUtil";
import { TranslationAPIService } from "../../translation/server/TranslationService";
import { CMDBAPIService } from "../../cmdb/server/CMDBService";

export class TicketDetailsDFDataBuilder {
    public static async getDFDisplayValues(
        token: string, fieldValue: DynamicFieldValue
    ): Promise<[string[], string, string[]]> {
        let values = [];
        let separator = '';

        if (fieldValue) {
            const dynamicField = await DynamicFieldAPIService.getInstance().loadDynamicField(
                token,
                fieldValue.Name ? fieldValue.Name : null,
                fieldValue.ID ? Number(fieldValue.ID) : null
            );

            if (dynamicField) {
                separator = dynamicField.Config && dynamicField.Config.ItemSeparator ?
                    dynamicField.Config.ItemSeparator : ', ';
                switch (dynamicField.FieldType) {
                    case DynamicFieldType.DATE:
                    case DynamicFieldType.DATE_TIME:
                        values = await this.getDFDateDateTimeFieldValues(token, dynamicField, fieldValue);
                        break;
                    case DynamicFieldType.SELECTION:
                        values = await this.getDFSelectionFieldValues(token, dynamicField, fieldValue);
                        break;
                    case DynamicFieldType.CI_REFERENCE:
                        values = await this.getDFCIReferenceFieldValues(token, fieldValue);
                        break;
                    case DynamicFieldType.CHECK_LIST:
                        values = this.getDFChecklistFieldShortValues(fieldValue);
                        break;
                    default:
                        values = Array.isArray(fieldValue.Value) ? fieldValue.Value : [fieldValue.Value];
                }
            }
        }

        return [values, values.join(separator), fieldValue.Value];
    }
    public static async getDFDateDateTimeFieldValues(
        token: string, field: DynamicField, fieldValue: DynamicFieldValue
    ): Promise<string[]> {
        let values;

        if (Array.isArray(fieldValue.Value)) {
            const valuesPromises = [];
            for (const v of fieldValue.Value) {
                if (field.FieldType === DynamicFieldType.DATE) {
                    valuesPromises.push(DateTimeUtil.getLocalDateString(token, v));
                } else {
                    valuesPromises.push(DateTimeUtil.getLocalDateTimeString(token, v));
                }
            }
            values = await Promise.all<string>(valuesPromises);
        } else {
            let v: string;
            if (field.FieldType === DynamicFieldType.DATE) {
                v = await DateTimeUtil.getLocalDateString(token, fieldValue.DisplayValue);
            } else {
                v = await DateTimeUtil.getLocalDateTimeString(token, fieldValue.DisplayValue);
            }
            values = [v];
        }

        return values;
    }

    public static async getDFSelectionFieldValues(
        token: string, field: DynamicField, fieldValue: DynamicFieldValue
    ): Promise<string[]> {
        let values = fieldValue.PreparedValue;

        const lang = await TranslationAPIService.getUserLanguage(token);

        if (!values && field.Config && field.Config.PossibleValues && Array.isArray(fieldValue.Value)) {
            const valuesPromises = [];
            const translate = Boolean(field.Config.TranslatableValues);
            for (const v of fieldValue.Value) {
                if (field.Config.PossibleValues[v]) {
                    if (translate) {
                        valuesPromises.push(
                            TranslationAPIService.getInstance().translate(field.Config.PossibleValues[v], [], lang)
                        );
                    } else {
                        valuesPromises.push(field.Config.PossibleValues[v]);
                    }
                }
            }
            values = await Promise.all<string>(valuesPromises);
        }

        return values;
    }

    public static getDFChecklistFieldShortValues(fieldValue: DynamicFieldValue): string[] {
        const values = fieldValue.DisplayValueShort ? fieldValue.DisplayValueShort.split(', ') : [];
        if (
            (!values || !values.length) &&
            Array.isArray(fieldValue.Value)
        ) {
            for (const v of fieldValue.Value) {
                const checklist = JSON.parse(v);
                const counts = DynamicFieldFormUtil.countValues(checklist);
                values.push(`${counts[0]}/${counts[1]}`);
            }
        }
        return values;
    }

    public static async getDFCIReferenceFieldValues(token: string, fieldValue: DynamicFieldValue): Promise<string[]> {
        let values = fieldValue.PreparedValue;

        if (!values && fieldValue.Value) {
            if (!Array.isArray(fieldValue.Value)) {
                values = [fieldValue.Value];
            } else {
                values = fieldValue.Value;
            }
            const configItems = await CMDBAPIService.getInstance().loadObjects<ConfigItem>(
                token, '',
                KIXObjectType.CONFIG_ITEM, values,
                new KIXObjectLoadingOptions(
                    null, null, null, [ConfigItemProperty.CURRENT_VERSION]
                ), null
            ).catch(() => [] as ConfigItem[]);

            values = configItems.map((ci) => ci.Number + '#' + ci.Name);
        }
        return values || [];
    }
}