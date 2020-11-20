/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { AgentService } from '../../../../user/webapp/core';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { HomeContext } from '../../../../home/webapp/core';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../../model/ContextMode';
import { ContextType } from '../../../../../model/ContextType';
import { SliderContent } from '../../../model/SliderContent';
import { SliderWidgetConfiguration } from '../../../model/SliderWidgetConfiguration';

class Component extends AbstractMarkoComponent<ComponentState> {

    private sliderImage;
    private sliderContent;
    private changeSliderTimeout;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const currentUser = await AgentService.getInstance().getCurrentUser();
        if (currentUser && currentUser.UserID !== 1) {
            this.state.userString = currentUser.Contact ? currentUser.Contact.Fullname : currentUser.UserLogin;
        }

        await this.prepareSliderList(currentUser.UserID);

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Welcome to KIX 18', 'Translatable#No, thank you', 'Translatable#Yes, please',
            'Translatable#Lets go', 'Translatable#previous', 'Translatable#next',
            ...this.state.sliderList.map((s) => s.title)
        ]);

        this.showSlider(0);
        this.sliderImage = (this as any).getEl('slider-image');
        this.sliderContent = (this as any).getEl('slider-content');
    }

    public showSlider(index: number): void {
        if (index < 0) {
            index = 0;
        } else if (index > this.state.sliderList.length - 1) {
            index = this.state.sliderList.length - 1;
        }
        if (this.sliderImage) {
            this.sliderImage.classList.add('change-slider');
        }
        if (this.sliderContent) {
            this.sliderContent.classList.add('change-slider');
        }
        if (this.changeSliderTimeout) {
            clearTimeout(this.changeSliderTimeout);
        }
        this.changeSliderTimeout = setTimeout(() => {
            clearTimeout(this.changeSliderTimeout);
            this.state.activeSliderIndex = index;
            this.state.activeSlider = this.state.sliderList[index];
            if (this.sliderImage) {
                this.sliderImage.classList.remove('change-slider');
            }
            if (this.sliderContent) {
                this.sliderContent.classList.remove('change-slider');
            }
        }, 200);
    }

    public async showHome(): Promise<void> {
        await ContextService.getInstance().setContext(
            HomeContext.CONTEXT_ID, KIXObjectType.ANY, ContextMode.DASHBOARD
        );
    }

    public previousSlider(): void {
        if (this.state.activeSliderIndex > 0) {
            this.showSlider(this.state.activeSliderIndex - 1);
        }
    }

    public nextSlider(): void {
        if (this.state.activeSliderIndex > 0 && this.state.activeSliderIndex < this.state.sliderList.length - 1) {
            this.showSlider(this.state.activeSliderIndex + 1);
        }
    }

    private async prepareSliderList(userId: number): Promise<void> {
        const currentContext = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.state.widgetConfiguration = currentContext
            ? await currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        if (this.state.widgetConfiguration) {
            this.state.sliderList = [
                new SliderContent(
                    userId === 1 ? 'Translatable#Welcome to KIX 18' : 'Translatable#Hello',
                    'Translatable#QuickstartGuide_Text_Start',
                    'Slider_Start.png'
                )
            ];

            const sliderConfig: SliderWidgetConfiguration = this.state.widgetConfiguration.configuration;
            if (sliderConfig && Array.isArray(this.state.widgetConfiguration.configuration.sliderList)) {
                this.state.widgetConfiguration.configuration.sliderList.forEach((s) => {
                    if (s && s.title) {
                        this.state.sliderList.push(s);
                    }
                });
            }

            this.state.sliderList.push(
                new SliderContent(
                    'Translatable#You did it!',
                    'Translatable#QuickstartGuide_Text_End',
                    'Slider_End.png'
                )
            );
        }
    }
}

module.exports = Component;
