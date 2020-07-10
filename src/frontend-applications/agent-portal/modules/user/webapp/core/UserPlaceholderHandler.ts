/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { User } from '../../model/User';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import { AgentService } from '.';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { UserProperty } from '../../model/UserProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ContactProperty } from '../../../customer/model/ContactProperty';
import { AbstractPlaceholderHandler } from '../../../base-components/webapp/core/AbstractPlaceholderHandler';

export class UserPlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '100-UserPlaceholderHandler';
    protected objectStrings: string[] = [
        'CURRENT'
    ];

    public async replace(placeholder: string, user?: User, language: string = 'en'): Promise<string> {
        let result = '';
        const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
        if (objectString === 'CURRENT') {
            const currentUser = await AgentService.getInstance().getCurrentUser();
            if (currentUser) {
                user = currentUser;
            }
        }
        if (user) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            if (attribute && this.isKnownProperty(attribute)) {
                if (!PlaceholderService.getInstance().translatePlaceholder(placeholder)) {
                    language = 'en';
                }
                switch (attribute) {
                    case UserProperty.USER_ID:
                    case KIXObjectProperty.VALID_ID:
                        result = user[attribute].toString();
                        break;
                    case UserProperty.USER_LOGIN:
                    case ContactProperty.FIRSTNAME:
                    case ContactProperty.LASTNAME:
                    case ContactProperty.EMAIL:
                    case ContactProperty.COMMENT:
                    case UserProperty.USER_COMMENT:
                    case ContactProperty.TITLE:
                        result = await LabelService.getInstance().getDisplayText(
                            user, attribute, undefined, false
                        );
                        break;
                    case KIXObjectProperty.CREATE_TIME:
                    case KIXObjectProperty.CHANGE_TIME:
                        result = await DateTimeUtil.getLocalDateTimeString(user[attribute], language);
                        break;
                    default:
                        result = await LabelService.getInstance().getDisplayText(
                            user, attribute, undefined, false
                        );
                        result = typeof result !== 'undefined' && result !== null
                            ? await TranslationService.translate(result.toString(), undefined, language) : '';
                }
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(UserProperty).map((p) => UserProperty[p]);
        knownProperties = [
            ...knownProperties,
            ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p]),
            ...Object.keys(ContactProperty).map((p) => ContactProperty[p])
        ];
        return knownProperties.some((p) => p === property);
    }
}
