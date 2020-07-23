/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { IdService } from '../../../../../model/IdService';
import { MailFilterMatchManager } from '../../core';
import { MailFilterMatch } from '../../../model/MailFilterMatch';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormService } from '../../../../base-components/webapp/core/FormService';

class Component extends FormInputComponent<any[], ComponentState> {

    private formListenerId: string;
    private matchFormTimeout: any;

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('mail-filter-match-form-listener-');
        await this.prepareTranslations();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        this.state.matchManager = new MailFilterMatchManager();
        this.state.matchManager.reset();
        this.state.matchManager.init();
        this.state.matchManager.registerListener(this.formListenerId, () => {
            if (this.matchFormTimeout) {
                clearTimeout(this.matchFormTimeout);
            }
            this.matchFormTimeout = setTimeout(async () => {
                const matchValues: MailFilterMatch[] = [];
                if (await this.state.matchManager.hasDefinedValues()) {
                    const values = await this.state.matchManager.getEditableValues();
                    values.forEach((v) => {
                        if (v.property && v.value && (v.value as MailFilterMatch).Value) {
                            matchValues.push(
                                new MailFilterMatch(
                                    v.property,
                                    (v.value as MailFilterMatch).Value,
                                    (v.value as MailFilterMatch).Not
                                )
                            );
                        }
                    });
                }
                super.provideValue(matchValues);
            }, 200);
        });
        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        if (this.state.matchManager) {
            this.state.matchManager.unregisterListener(this.formListenerId);
        }
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<MailFilterMatch[]>(this.state.field.instanceId);
        if (value && Array.isArray(value.value)) {
            value.value.forEach((match: MailFilterMatch) => {
                this.state.matchManager.setValue(
                    new ObjectPropertyValue(
                        match.Key, null, match, false, true, null, null, null, match.Key
                    )
                );
            });
        }
    }

    private async prepareTranslations(): Promise<void> {
        const translations: string[] = await TranslationService.createTranslationArray(
            [
                'Translatable#Email Header', 'Translatable#Helptext_Admin_MailFilter_FilterConditions_EmailHeader',
                'Translatable#Negate', 'Translatable#Helptext_Admin_MailFilter_FilterConditions_Negate',
                'Translatable#Pattern', 'Translatable#Helptext_Admin_MailFilter_FilterConditions_Pattern',
            ]
        );
        if (translations && !!translations.length) {
            this.state.translations.set('HeaderTitle', translations[0]);
            this.state.translations.set('HeaderHint', translations[1]);
            this.state.translations.set('NegateTitle', translations[2]);
            this.state.translations.set('NegateHint', translations[3]);
            this.state.translations.set('PatternTitle', translations[4]);
            this.state.translations.set('PatternHint', translations[5]);
        }
    }
}

module.exports = Component;
