/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketHistory, DateTimeUtil, ObjectIcon, KIXObjectType, TicketHistoryProperty, User } from '../../model';
import { TranslationService } from '../i18n/TranslationService';
import { KIXObjectService } from '../kix';
import { LabelProvider } from '../LabelProvider';

export class TicketHistoryLabelProvider extends LabelProvider<TicketHistory> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_HISTORY;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TicketHistoryProperty.HISTORY_TYPE:
                displayValue = 'Translatable#Action';
                break;
            case TicketHistoryProperty.NAME:
                displayValue = 'Translatable#Comment';
                break;
            case TicketHistoryProperty.ARTICLE_ID:
                displayValue = 'Translatable#to Article';
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
        historyEntry: TicketHistory, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = historyEntry[property];

        switch (property) {
            case TicketHistoryProperty.ARTICLE_ID:
                displayValue = displayValue === 0 ?
                    ''
                    : await TranslationService.translate('Translatable#to Article');
                break;
            case TicketHistoryProperty.CREATE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [displayValue], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : displayValue;
                break;
            case TicketHistoryProperty.CREATE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
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

    public getDisplayTextClasses(object: TicketHistory, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: TicketHistory): string[] {
        return [];
    }

    public isLabelProviderFor(object: TicketHistory): boolean {
        return object instanceof TicketHistory;
    }

    public async getObjectText(object: TicketHistory): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public getObjectAdditionalText(object: TicketHistory): string {
        throw new Error('Method not implemented.');
    }

    public getObjectIcon(object: TicketHistory): string | ObjectIcon {
        throw new Error('Method not implemented.');
    }

    public getObjectTooltip(object: TicketHistory): string {
        throw new Error('Method not implemented.');
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = 'Translatable#Ticket History';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }

        return displayValue;
    }

    public async getIcons(object: TicketHistory, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === TicketHistoryProperty.ARTICLE_ID && object.ArticleID) {
            icons.push('kix-icon-open-right');
        }
        return icons;
    }

}
