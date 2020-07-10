/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../model/ContextType';
import { NotificationProperty } from '../../model/NotificationProperty';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { ArticleProperty } from '../../../ticket/model/ArticleProperty';
import { NotificationService } from '.';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { NotificationMessage } from '../../model/NotificationMessage';
import { Notification } from '../../model/Notification';
import { TicketProperty } from '../../../ticket/model/TicketProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { IdService } from '../../../../model/IdService';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';

export class NotificationFormService extends KIXObjectFormService {

    private static INSTANCE: NotificationFormService = null;

    public static getInstance(): NotificationFormService {
        if (!NotificationFormService.INSTANCE) {
            NotificationFormService.INSTANCE = new NotificationFormService();
        }

        return NotificationFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.NOTIFICATION;
    }

    protected async prePrepareForm(form: FormConfiguration, notification?: Notification): Promise<void> {
        if (notification && notification.Events) {
            const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
            if (context) {
                context.setAdditionalInformation(
                    NotificationProperty.DATA_EVENTS, notification.Events
                );
            }
        }
    }

    protected async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, notification: Notification
    ): Promise<void> {
        if (form) {
            const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
                KIXObjectType.TRANSLATION_PATTERN
            );
            const languages = await translationService.getLanguages();
            const languageFields: FormFieldConfiguration[] = [];
            if (languages) {
                languages.forEach((l) => {
                    const languagField = this.getLanguageField(form, l);
                    languageFields.push(languagField);

                    if (
                        form.formContext === FormContext.EDIT &&
                        notification && notification.Message && notification.Message[l[0]]
                    ) {
                        this.setTextValue(languagField.children, formFieldValues, notification.Message[l[0]]);
                    }
                });
            }
            if (!!languageFields.length) {
                form.pages[form.pages.length - 1].groups.push(
                    new FormGroupConfiguration(
                        'notification-form-text', 'Translatable#Notification Text', [], null, languageFields
                    )
                );
            }
        }
    }

    protected async getValue(
        property: string, value: any, notification: Notification, formField: FormFieldConfiguration
    ): Promise<any> {
        switch (property) {
            case NotificationProperty.DATA_FILTER:
                if (notification && notification.Filter) {
                    const articleProperty = [
                        ArticleProperty.SENDER_TYPE_ID, ArticleProperty.CHANNEL_ID, ArticleProperty.TO,
                        ArticleProperty.CC, ArticleProperty.FROM, ArticleProperty.SUBJECT, ArticleProperty.BODY
                    ];
                    let hasArticleEvent = false;
                    value = [];
                    const context = ContextService.getInstance().getActiveContext();
                    if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
                        const selectedEvents = context.getAdditionalInformation(NotificationProperty.DATA_EVENTS);
                        hasArticleEvent = selectedEvents
                            ? await NotificationService.getInstance().hasArticleEvent(selectedEvents)
                            : false;
                    }

                    notification.Filter.forEach((v, k) => {
                        if (hasArticleEvent || !articleProperty.some((p) => k === p)) {
                            value.push([k, v]);
                        }
                    });
                }
                break;
            default:
        }
        return value;
    }

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case NotificationProperty.DATA_RECIPIENT_AGENTS:
                hasPermissions = await this.checkPermissions('system/users');
                break;
            case NotificationProperty.DATA_RECIPIENT_ROLES:
                hasPermissions = await this.checkPermissions('system/roles');
                break;
            default:
        }
        return hasPermissions;
    }

    private getLanguageField(form: FormConfiguration, language: [string, string]): FormFieldConfiguration {
        const subjectField = new FormFieldConfiguration(
            'subject-field',
            'Translatable#Subject', `${NotificationProperty.MESSAGE_SUBJECT}###${language[0]}`, null, true,
            form && form.formContext === FormContext.EDIT ?
                'Translatable#Helptext_Admin_NotificationEdit_MessageSubject' :
                'Translatable#Helptext_Admin_NotificationCreate_MessageSubject'
        );
        subjectField.instanceId = IdService.generateDateBasedId(`notification-${language[0]}`);
        const bodyField = new FormFieldConfiguration(
            'body-field',
            'Translatable#Text', `${NotificationProperty.MESSAGE_BODY}###${language[0]}`, 'rich-text-input', true,
            form && form.formContext === FormContext.EDIT ?
                'Translatable#Helptext_Admin_NotificationEdit_MessageText' :
                'Translatable#Helptext_Admin_NotificationCreate_MessageText',
            [new FormFieldOption('NO_IMAGES', true)]
        );
        bodyField.instanceId = IdService.generateDateBasedId(`notification-${language[0]}`);
        const languagField = new FormFieldConfiguration(
            'language-field',
            language[1], null, null, null, null, null, null, null, [subjectField, bodyField],
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            true, true
        );
        languagField.instanceId = IdService.generateDateBasedId(`notification-${language[0]}`);
        return languagField;
    }

    private setTextValue(
        fields: FormFieldConfiguration[], formFieldValues: Map<string, FormFieldValue<any>>,
        message: NotificationMessage
    ): void {
        let subjectValue;
        let bodyValue;
        if (message) {
            if (message.Subject) {
                subjectValue = new FormFieldValue(message.Subject);
            }
            if (message.Body) {
                bodyValue = new FormFieldValue(message.Body);
            }
        }
        if (subjectValue) {
            formFieldValues.set(fields[0].instanceId, subjectValue);
        }
        if (bodyValue) {
            formFieldValues.set(fields[1].instanceId, bodyValue);
        }
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case NotificationProperty.DATA_VISIBLE_FOR_AGENT:
            case NotificationProperty.DATA_SEND_ONCE_A_DAY:
            case NotificationProperty.DATA_SEND_DESPITE_OOO:
            case NotificationProperty.DATA_RECIPIENT_SUBJECT:
            case NotificationProperty.DATA_CREATE_ARTICLE:
                value = Number(value);
                break;
            case NotificationProperty.DATA_RECIPIENT_EMAIL:
                value = Array.isArray(value) ? value.join(',') : value;
                break;
            case NotificationProperty.DATA_FILTER:
                if (Array.isArray(value)) {
                    for (const v of value) {
                        switch (v[0]) {
                            case TicketProperty.TYPE_ID:
                            case TicketProperty.STATE_ID:
                            case TicketProperty.PRIORITY_ID:
                            case TicketProperty.QUEUE_ID:
                            case TicketProperty.LOCK_ID:
                            case TicketProperty.ORGANISATION_ID:
                            case TicketProperty.CONTACT_ID:
                            case TicketProperty.OWNER_ID:
                            case TicketProperty.RESPONSIBLE_ID:
                                v[0] = 'Ticket::' + v[0];
                                break;
                            case ArticleProperty.SENDER_TYPE_ID:
                            case ArticleProperty.CHANNEL_ID:
                            case ArticleProperty.TO:
                            case ArticleProperty.CC:
                            case ArticleProperty.FROM:
                            case ArticleProperty.SUBJECT:
                            case ArticleProperty.BODY:
                                v[0] = 'Article::' + v[0];
                                break;
                            default:
                                if (v[0].match(new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`))) {
                                    v[0] = v[0].replace(
                                        new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`),
                                        'Ticket::DynamicField_$1'
                                    );
                                }
                        }
                    }
                }
                break;
            default:

        }
        return [[property, value]];
    }

    public async preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>> {
        return [
            ['Transports', ['Email']]
        ];
    }
}
