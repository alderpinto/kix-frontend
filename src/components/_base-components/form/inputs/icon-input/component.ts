/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ObjectIcon, OverlayType, ComponentContent, FormInputComponent, ContextType } from '../../../../../core/model';
import { AttachmentUtil, BrowserUtil, ContextService, LabelService } from '../../../../../core/browser';
import { OverlayService } from '../../../../../core/browser/OverlayService';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends FormInputComponent<any, ComponentState> {

    private dragCounter: number;
    private mimeTypes: string[];

    public onCreate(): void {
        this.state = new ComponentState();
        this.mimeTypes = [
            'image/bmp',
            'image/gif',
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/x-icon'
        ];
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#select image file"
        ]);

        await super.onMount();
        const uploadElement = (this as any).getEl();
        if (uploadElement) {
            uploadElement.addEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        } else {
            document.addEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        }
        document.addEventListener('dragenter', this.dragEnter.bind(this), false);
        document.addEventListener('dragleave', this.dragLeave.bind(this), false);

        await this.setCurrentValue();
    }

    public async setCurrentValue(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.icon = this.state.defaultValue.value;
        }
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
        const uploadElement = (this as any).getEl();
        if (uploadElement) {
            uploadElement.removeEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        } else {
            document.removeEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        }
        document.removeEventListener('dragenter', this.dragEnter.bind(this), false);
        document.removeEventListener('dragleave', this.dragLeave.bind(this), false);
    }

    private preventDefaultDragBehavior(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    public triggerFileUpload(): void {
        const uploadInput = (this as any).getEl('iconUploadInput');
        if (uploadInput) {
            uploadInput.click();
        }
    }

    public setIcon(): void {
        const uploadInput = (this as any).getEl('iconUploadInput');
        if (uploadInput && uploadInput.files) {
            this.checkAndSetIcon(Array.from(uploadInput.files));
        }
    }

    private async checkAndSetIcon(files: File[]): Promise<void> {
        const fileError = await AttachmentUtil.checkFile(files[0], this.mimeTypes);

        if (fileError) {
            const errorMessages = await AttachmentUtil.buildErrorMessages([[files[0], fileError]]);
            const title = await TranslationService.translate('Translatable#Error while adding the image:');
            const content = new ComponentContent('list-with-title',
                {
                    title,
                    list: errorMessages
                }
            );

            const error = await TranslationService.translate('Translatable#Error');

            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING,
                null,
                content,
                error,
                true
            );
        } else {
            const content = await BrowserUtil.readFile(files[0]);
            this.state.icon = new ObjectIcon(
                null, null,
                files[0].type,
                content
            );
            this.state.title = files[0].name;
            super.provideValue(this.state.icon);
        }
    }

    private dragEnter(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.dragCounter++;
        this.state.dragging = true;
    }

    private dragLeave(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.dragCounter--;
        if (this.dragCounter === 0) {
            this.state.dragging = false;
        }
    }

    public drop(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        if (event.dataTransfer.files) {
            const files: File[] = Array.from(event.dataTransfer.files);
            this.checkAndSetIcon(files.filter((f) => f.type !== '' || (f.size % 4096 > 0)));
        }

        this.state.dragging = false;
        this.dragCounter = 0;
    }
}

module.exports = Component;
