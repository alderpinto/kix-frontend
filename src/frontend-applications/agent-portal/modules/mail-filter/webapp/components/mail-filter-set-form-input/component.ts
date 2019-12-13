/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { FormInputComponent } from "../../../../../modules/base-components/webapp/core/FormInputComponent";
import { IdService } from "../../../../../model/IdService";
import { MailFilterSetManager } from "../../core";
import { MailFilterSet } from "../../../model/MailFilterSet";
import { IDynamicFormManager } from "../../../../base-components/webapp/core/dynamic-form/IDynamicFormManager";
import { ObjectPropertyValue } from "../../../../../model/ObjectPropertyValue";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";

class Component extends FormInputComponent<any[], ComponentState> {

    private formListenerId: string;
    private matchFormTimeout: any;

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('mail-filter-set-form-listener-');
        await this.prepareTranslations();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const matchManager = new MailFilterSetManager();
        if (matchManager) {
            matchManager.init();
            await this.setCurrentNode(matchManager);
            this.state.setManager = matchManager;
            this.state.setManager.registerListener(this.formListenerId, () => {
                if (this.matchFormTimeout) {
                    clearTimeout(this.matchFormTimeout);
                }
                this.matchFormTimeout = setTimeout(async () => {
                    const setValues: MailFilterSet[] = [];
                    if (this.state.setManager.hasDefinedValues()) {
                        const values = this.state.setManager.getEditableValues();
                        values.forEach((v) => {
                            if (v.property && v.value && v.value) {
                                setValues.push(
                                    new MailFilterSet(
                                        v.property,
                                        v.value
                                    )
                                );
                            }
                        });
                    }
                    super.provideValue(setValues);
                }, 200);
            });
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.state.setManager) {
            this.state.setManager.unregisterListener(this.formListenerId);
        }
    }

    public async setCurrentNode(setManager: IDynamicFormManager): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value && Array.isArray(this.state.defaultValue.value)) {
            this.state.defaultValue.value.forEach((set: MailFilterSet) => {
                setManager.setValue(
                    new ObjectPropertyValue(set.Key, null, set.Value, false, true, null, null, null, set.Key)
                );
            });
            super.provideValue(this.state.defaultValue.value);
        }
    }

    private async prepareTranslations(): Promise<void> {
        const translations: string[] = await TranslationService.createTranslationArray(
            [
                'Translatable#Set Email Header', 'Translatable#Helptext_Admin_MailFilter_SetEmailHeader_EmailHeader',
                'Translatable#Set Value', 'Translatable#Helptext_Admin_MailFilter_SetEmailHeader_Value',
            ]
        );
        if (translations && !!translations.length) {
            this.state.translations.set('HeaderTitle', translations[0]);
            this.state.translations.set('HeaderHint', translations[1]);
            this.state.translations.set('ValueTitle', translations[2]);
            this.state.translations.set('ValueHint', translations[3]);
        }
    }
}

module.exports = Component;