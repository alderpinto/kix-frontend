/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.activePageIndex = input.activePageIndex;
        this.state.pages = input.pages;
        this.prepareTranslations();
    }

    public async onMount(): Promise<void> {
        this.prepareTranslations();
        document.addEventListener('keydown', this.keyDown.bind(this), false);
    }

    public onDestroy(): void {
        document.removeEventListener('keydown', this.keyDown.bind(this), false);
    }

    public keyDown(event: any): void {
        if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && event.ctrlKey) {
            if (event.key === 'ArrowRight') {
                this.showPage(this.state.activePageIndex + 1);
            } else {
                this.showPage(this.state.activePageIndex - 1);
            }
        }
    }

    private async prepareTranslations(): Promise<void> {
        if (this.state.pages) {
            this.state.translations = await TranslationService.createTranslationObject([
                'Translatable#Next', 'Translatable#Previous',
                ...this.state.pages.map((p) => p.name)
            ]);
        }
    }

    public showPage(index: number): void {
        (this as any).emit('showPage', index);
    }
}

module.exports = Component;
