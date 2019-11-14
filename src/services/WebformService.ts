/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Webform, CreateWebformTicketRequest } from "../core/model/webform";
import {
    ConfigurationService, LoggingService, TicketService, AuthenticationService, TranslationService
} from "../core/services";
import {
    Error, DateTimeUtil, TicketProperty, ArticleProperty, KIXObjectType, SysConfigOption, SysConfigKey,
    Attachment
} from "../core/model";
import { IdService } from "../core/browser";
import { KIXIntegrationRouter } from "../routes/KIXIntegrationRouter";
import { SysConfigService } from "../core/services";
import addrparser = require('address-rfc2822');

export class WebformService {

    private static INSTANCE: WebformService;

    public static getInstance(): WebformService {
        if (!WebformService.INSTANCE) {
            WebformService.INSTANCE = new WebformService();
        }
        return WebformService.INSTANCE;
    }

    private constructor() { }

    public loadWebforms(withPassword: boolean = false): Webform[] {
        const webformsConfiguration = ConfigurationService.getInstance().getConfiguration('webforms');
        const webforms: Webform[] = webformsConfiguration ? webformsConfiguration : [];
        if (!withPassword) {
            webforms.forEach((wf) => delete wf.webformUserPassword);
        }
        return webforms;
    }

    public getWebform(formId: number, withPassword?: boolean): Webform {
        let form;
        if (formId) {
            const forms = this.loadWebforms(withPassword);
            if (forms && forms.length) {
                form = forms.find((f) => f.ObjectId === Number(formId));
            }
        }
        return form;
    }

    public async saveWebform(userId: number, webform: Webform, webformId?: number): Promise<number> {
        const date = DateTimeUtil.getKIXDateTimeString(new Date());

        const webforms = this.loadWebforms(true);

        webform.ChangeBy = userId;
        webform.ChangeTime = date;
        if (!webformId) {
            webform.CreateBy = userId;
            webform.CreateTime = date;
            webform.ObjectId = Date.now();
            webforms.push(webform);
        } else {
            webform.ObjectId = webformId;
            const webformIndex = webforms.findIndex((f) => f.ObjectId === Number(webformId));
            if (webformIndex !== -1) {
                webform.CreateBy = webforms[webformIndex].CreateBy;
                webform.CreateTime = webforms[webformIndex].CreateTime;
                if (!webform.webformUserPassword || webform.webformUserPassword === '--NOT_CHANGED--') {
                    webform.webformUserPassword = webforms[webformIndex].webformUserPassword;
                }
                webforms.splice(webformIndex, 1, webform);
            }
        }

        await ConfigurationService.getInstance().saveConfiguration('webforms', webforms)
            .then(() => {
                KIXIntegrationRouter.getInstance().registerRoute(Number(webform.ObjectId));
            })
            .catch((error: Error) => {
                LoggingService.getInstance().error(error.Message, error);
            });

        return webform.ObjectId;
    }

    public async createTicket(request: CreateWebformTicketRequest, formId: number, language?: string): Promise<number> {
        let errorString = await this.checkRequest(request, language);
        if (formId && !errorString) {
            const form = this.getWebform(formId, true);
            if (form && form.userLogin && form.webformUserPassword) {
                const parameter = this.prepareParameter(request, form);
                const token = await AuthenticationService.getInstance().login(
                    form.userLogin, form.webformUserPassword, IdService.generateDateBasedId('web-form-login'),
                    false
                ).catch((error) => null);
                if (token) {
                    const result = await TicketService.getInstance().createObject(
                        token, null, KIXObjectType.TICKET, parameter
                    ).catch((error) => null);
                    AuthenticationService.getInstance().logout(token).catch((error) => null);
                    if (result) {
                        return result;
                    }
                }
            }

            errorString = await TranslationService.getInstance().translate(
                'Translatable#Could not handle request.', undefined, language
            );
        }

        throw new Error(null, errorString, 400);
    }

    private async checkRequest(request: CreateWebformTicketRequest, language?: string): Promise<string> {
        let errorString;
        if (!request.name) {
            errorString = await TranslationService.getInstance().translate(
                'Translatable#{0} is required.', ['Name'], language
            );
        } else if (!request.email) {
            errorString = await TranslationService.getInstance().translate(
                'Translatable#{0} is required.', ['Email'], language
            );
        } else if (!this.checkEmail(request.email)) {
            errorString = await TranslationService.getInstance().translate(
                'Translatable#Inserted email address is invalid', undefined, language
            ) + '.';
        } else if (!request.subject) {
            errorString = await TranslationService.getInstance().translate(
                'Translatable#{0} is required.', ['Subject'], language
            );
        } else if (!request.message) {
            errorString = await TranslationService.getInstance().translate(
                'Translatable#{0} is required.', ['Message'], language
            );
        } else {
            errorString = await this.checkFiles(request.files, language);
        }
        return errorString;
    }

    private prepareParameter(request: CreateWebformTicketRequest, form: Webform): Array<[string, any]> {
        const from = request.name && !request.email.match(/.+ <.+>/)
            ? `${request.name} <${request.email}>` : request.email;
        const attachments = this.prepareFiles(request.files);
        const parameter: Array<[string, any]> = [
            [TicketProperty.TITLE, request.subject],
            [TicketProperty.CONTACT_ID, request.email],
            [TicketProperty.ORGANISATION_ID, request.email],
            [TicketProperty.STATE_ID, form.StateID],
            [TicketProperty.PRIORITY_ID, form.PrioritiyID],
            [TicketProperty.QUEUE_ID, form.QueueID],
            [TicketProperty.TYPE_ID, form.TypeID],
            [TicketProperty.OWNER_ID, 1],
            [TicketProperty.RESPONSIBLE_ID, 1],
            [ArticleProperty.FROM, from],
            [ArticleProperty.SUBJECT, request.subject],
            [ArticleProperty.BODY, request.message],
            [ArticleProperty.ATTACHMENTS, attachments],
            [ArticleProperty.SENDER_TYPE_ID, 3],
            [ArticleProperty.CHANNEL_ID, 1],
        ];
        return parameter;
    }

    // TODO: copied from FormValidationService
    private checkEmail(email: string): boolean {
        let isValidEmail: boolean = true;
        try {
            addrparser.parse(email.trim().toLowerCase());
        } catch {
            isValidEmail = false;
        }
        return isValidEmail;
    }

    private async checkFiles(filesWithContent: any[], language?: string) {
        if (filesWithContent && !!filesWithContent.length) {
            if (filesWithContent.length > 5) {
                return await TranslationService.getInstance().translate(
                    'Translatable#Not more than 5 files possible.', undefined, language
                );
            } else {
                const maxSize = await this.getMaxFileSize();
                for (const file of filesWithContent) {
                    if (maxSize && file.size > maxSize) {
                        const error = file.name + ': ' + await TranslationService.getInstance().translate(
                            "Translatable#is to large (max {0}).",
                            [this.getFileSize(maxSize)], language
                        );
                        return error;
                    }
                    if (!file.content) {
                        return await TranslationService.getInstance().translate(
                            "Translatable#Could not load file '{0}'.",
                            [file.name], language
                        );
                    }
                }
            }
        }
        return;
    }

    private prepareFiles(filesWithContent: any[]): Attachment[] {
        const attachments: Attachment[] = [];
        filesWithContent.forEach((f) => {
            const attachment = new Attachment();
            attachment.ContentType = f.type !== '' ? f.type : 'text';
            attachment.Filename = f.name;
            attachment.Content = f.content;
            attachment.FilesizeRaw = f.size;
            attachments.push(attachment);
        });
        return attachments;
    }

    public async getMaxFileSize(): Promise<number> {
        let maxSize = 1000 * 1000 * 24; // 24 MB
        const config = ConfigurationService.getInstance().getServerConfiguration();
        if (config && config.BACKEND_API_TOKEN) {
            const maxSizeOptions = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                config.BACKEND_API_TOKEN, IdService.generateDateBasedId('webform-service-'),
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.MAX_ALLOWED_SIZE], null, null
            ).catch((error) => [] as SysConfigOption[]);
            if (maxSizeOptions && !!maxSizeOptions.length && maxSizeOptions[0].Value) {
                maxSize = maxSizeOptions[0].Value;
            }
        }
        return maxSize;
    }

    public async getSuccessMessage(form: Webform, language?: string) {
        return await TranslationService.getInstance().translate(form.successMessage, undefined, language);
    }

    public async getTooManyFilesErrorMsg(language?: string) {
        return await TranslationService.getInstance().translate(
            'Translatable#Not more than 5 files possible.', undefined, language
        );
    }

    public async getFileTooBigErrorMsg(form: Webform, language?: string) {
        const maxSize = await this.getMaxFileSize();
        return await TranslationService.getInstance().translate(
            "Translatable#is to large (max {0}).", [this.getFileSize(maxSize)], language
        );
    }

    public async getWebformTranslationObject(form: Webform, language?: string): Promise<any> {
        const translationObject = {};
        const patterns = [
            form.buttonLabel ? form.buttonLabel : 'Translatable#Feedback',
            form.saveLabel ? form.buttonLabel : 'Translatable#Submit',
            form.title, form.hintMessage,
            'Translatable#Name', 'Translatable#Email', 'Translatable#Subject', 'Translatable#Message',
            'Translatable#Attachments', 'Translatable#Close', 'Translatable#Cancel',
            'Translatable#All form fields marked by * are required fields.'
        ];
        for (const pattern of patterns) {
            const text = await TranslationService.getInstance().translate(pattern, undefined, language);
            translationObject[pattern] = text;
        }
        return translationObject;
    }

    // TODO: copied from AttachmentUtil
    private getFileSize(fileSize: number, decPlaces: number = 1): string {
        let sizeString = fileSize + ' Byte';
        const siteUnits = ["kB", "MB", "GB"];
        for (
            let newSize = fileSize / 1000, sizeUnit = 0;
            newSize >= 1 && sizeUnit < 3;
            newSize /= 1000, sizeUnit++
        ) {
            sizeString = newSize.toFixed(decPlaces) + " " + siteUnits[sizeUnit];
        }
        return sizeString;
    }

}
