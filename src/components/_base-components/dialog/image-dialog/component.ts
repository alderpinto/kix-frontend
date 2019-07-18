/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { DisplayImageDescription } from '../../../../core/browser/components/DisplayImageDescription';
import { IImageDialogListener, DialogService } from '../../../../core/browser/components/dialog';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

export class Component implements IImageDialogListener {

    private state: ComponentState;
    private currImageIndex: number = 0;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().registerImageDialogListener(this);

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Next Image", "Translatable#Previous Image"
        ]);
    }

    public open(imageDescriptions: DisplayImageDescription[], showImageId?: string | number): void {
        this.state.show = true;
        this.state.imageDescriptions = imageDescriptions;

        this.currImageIndex = showImageId ? this.state.imageDescriptions.findIndex(
            (id) => id.imageId === showImageId
        ) : 0;
        this.state.image = this.state.imageDescriptions[this.currImageIndex];
    }

    public close(): void {
        this.state.show = false;
    }

    public previosImage(): void {
        if (this.state.imageDescriptions.length > 1) {
            const previosIndex = this.currImageIndex - 1;
            if (previosIndex > -1 && this.state.imageDescriptions[previosIndex]) {
                this.currImageIndex = previosIndex;
            } else {
                this.currImageIndex = this.state.imageDescriptions.length - 1;
            }
            this.state.image = this.state.imageDescriptions[this.currImageIndex];
        }
    }

    public nextImage(): void {
        if (this.state.imageDescriptions.length > 1) {
            const nextIndex = this.currImageIndex + 1;
            if (nextIndex <= this.state.imageDescriptions.length && this.state.imageDescriptions[nextIndex]) {
                this.currImageIndex = nextIndex;
            } else {
                this.currImageIndex = 0;
            }
            this.state.image = this.state.imageDescriptions[this.currImageIndex];
        }
    }
}

module.exports = Component;
