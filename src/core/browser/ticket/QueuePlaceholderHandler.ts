/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPlaceholderHandler, PlaceholderService } from "../placeholder";
import { DateTimeUtil, KIXObjectProperty, KIXObjectType, Queue, QueueProperty, KIXObject, Ticket } from "../../model";
import { LabelService } from "../LabelService";
import { TranslationService } from "../i18n/TranslationService";
import { KIXObjectService } from "../kix";
export class QueuePlaceholderHandler implements IPlaceholderHandler {

    public handlerId: string = 'QueuePlaceholderHandler';

    public isHandlerFor(objectString: string): boolean {
        return false;
    }

    public async replace(placeholder: string, ticket?: Ticket, language: string = 'en'): Promise<string> {
        let result = '';
        const queue = await this.getQueue(ticket);
        if (queue) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            if (attribute && this.isKnownProperty(attribute)) {
                const queueLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.QUEUE);
                if (!PlaceholderService.getInstance().translatePlaceholder(placeholder)) {
                    language = 'en';
                }
                switch (attribute) {
                    case QueueProperty.QUEUE_ID:
                    case KIXObjectProperty.VALID_ID:
                    case QueueProperty.PARENT_ID:
                    case QueueProperty.SYSTEM_ADDRESS_ID:
                    case QueueProperty.FOLLOW_UP_ID:
                        result = queue[attribute] ? queue[attribute].toString() : '';
                        break;
                    case QueueProperty.NAME:
                    case QueueProperty.FULLNAME:
                        result = await queueLabelProvider.getDisplayText(queue, attribute, undefined, false);
                        break;
                    case KIXObjectProperty.CREATE_TIME:
                    case KIXObjectProperty.CHANGE_TIME:
                        result = await DateTimeUtil.getLocalDateTimeString(queue[attribute], language);
                        break;
                    case QueueProperty.SUB_QUEUES:
                        break;
                    case QueueProperty.SIGNATURE:
                        result = await this.prepareSignature(queue, ticket, attribute, language);
                        break;
                    default:
                        result = await queueLabelProvider.getDisplayText(queue, attribute, undefined, false);
                        result = typeof result !== 'undefined' && result !== null
                            ? await TranslationService.translate(result.toString(), undefined, language) : '';
                }
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(QueueProperty).map((p) => QueueProperty[p]);
        knownProperties = [...knownProperties, ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p])];
        return knownProperties.some((p) => p === property);
    }

    private async getQueue(ticket: Ticket): Promise<Queue> {
        let queue: Queue = null;
        if (ticket.QueueID) {
            const queues = await KIXObjectService.loadObjects<Queue>(
                KIXObjectType.QUEUE, [ticket.QueueID], null, null, true
            ).catch((error) => [] as Queue[]);
            queue = queues && !!queues.length ? queues[0] : null;
        }
        return queue;
    }

    private async prepareSignature(queue: Queue, ticket: Ticket, attribute: string, language: string): Promise<string> {
        const queueLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.QUEUE);
        let result = await queueLabelProvider.getDisplayText(queue, attribute, undefined, false);
        const signatureRegex = PlaceholderService.getInstance().getPlaceholderRegex(
            'QUEUE', QueueProperty.SIGNATURE, false
        );
        while (result.match(signatureRegex)) {
            result = result.replace(signatureRegex, '');
        }
        result = await PlaceholderService.getInstance().replacePlaceholders(
            result, ticket, language
        );
        return result;
    }
}
