/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IMainDialogListener } from '../../../../../../modules/base-components/webapp/core/IMainDialogListener';
import { ConfiguredDialogWidget } from '../../../../../../model/configuration/ConfiguredDialogWidget';
import { DialogService } from '../../../../../../modules/base-components/webapp/core/DialogService';
import { ContextType } from '../../../../../../model/ContextType';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { EventService } from '../../../../../../modules/base-components/webapp/core/EventService';
import { DialogEvents } from '../../../../../../modules/base-components/webapp/core/DialogEvents';
import { DialogEventData } from '../../../../../../modules/base-components/webapp/core/DialogEventData';
import { WidgetConfiguration } from '../../../../../../model/configuration/WidgetConfiguration';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';

export class MainDialogComponent implements IMainDialogListener {

    private loadingTimeout: any;
    private state: ComponentState;

    private dialogId: string;
    public dialogWidgets: ConfiguredDialogWidget[] = [];
    public dialogTitle: string = null;
    public dialogIcon: string | ObjectIcon = null;

    private keyListenerElement;
    private keyListener;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerMainDialogListener(this);
    }

    public onDestroy(): void {
        if (this.keyListenerElement) {
            this.keyListenerElement.removeEventListener('keydown', this.handleKeyEvent.bind(this), false);
        }
    }

    private handleKeyEvent(event: any): void {
        if (event && event.key === 'Escape') {
            this.close();
        }
    }

    public open(
        dialogTitle: string, dialogs: ConfiguredDialogWidget[], dialogId?: string, dialogIcon?: string | ObjectIcon
    ): void {
        if (!this.state.show) {
            this.dialogTitle = dialogTitle;
            this.dialogIcon = dialogIcon;
            this.dialogWidgets = dialogs || [];
            this.state.dialogWidgets = dialogs ? dialogs.map((d) => d.configuration) : [];
            this.dialogId = dialogId;
            document.body.style.overflow = 'hidden';
            this.state.show = true;

            setTimeout(() => {
                this.keyListenerElement = (this as any).getEl();
                if (this.keyListenerElement) {
                    this.keyListener = this.handleKeyEvent.bind(this);
                    this.keyListenerElement.addEventListener('keydown', this.keyListener, false);
                }
            }, 50);
        }
    }

    public close(data?: any): void {
        const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        if (context) {
            EventService.getInstance().publish(
                DialogEvents.DIALOG_CANCELED,
                new DialogEventData(this.dialogId, data),
                context.getDialogSubscriberId()
            );
        }
        if (data && data.byX) {
            ContextService.getInstance().closeDialogContext();
        }

        if (this.keyListenerElement) {
            this.keyListenerElement.removeEventListener('keydown', this.handleKeyEvent.bind(this), false);
        }

        this.state.show = false;
        document.body.style.overflow = 'unset';
    }

    public submit(data?: any): void {
        this.state.show = false;
        document.body.style.overflow = 'unset';
        const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        if (context) {
            EventService.getInstance().publish(
                DialogEvents.DIALOG_FINISHED,
                new DialogEventData(this.dialogId, data),
                context.getDialogSubscriberId()
            );
        }
    }

    public async tabChanged(tab: WidgetConfiguration): Promise<void> {
        if (tab) {
            const dialog = this.dialogWidgets.find((d) => d.instanceId === tab.instanceId);

            DialogService.getInstance().setMainDialogLoading(true);

            await ContextService.getInstance().setDialogContext(
                null, dialog.kixObjectType, dialog.contextMode, undefined, false, undefined,
                false, undefined, undefined, false
            );

            DialogService.getInstance().setMainDialogLoading(false);

            this.dialogId = tab.instanceId;
        }
    }

    public setTitle(title: string): void {
        this.dialogTitle = title;
    }

    public setHint(hint: string): void {
        this.state.dialogHint = hint;
    }

    public setLoading(
        isLoading: boolean, loadingHint: string, showClose: boolean = false,
        time: number = null, cancelCallback: () => void
    ): void {
        if (this.loadingTimeout) {
            window.clearTimeout(this.loadingTimeout);
        }
        if (isLoading) {
            this.loadingTimeout = setTimeout(() => {
                this.state.loadingHint = loadingHint;
                this.state.isLoading = isLoading;
                this.state.showClose = showClose;
                this.state.time = time;
                this.state.cancelCallback = cancelCallback;
            }, 500);
        } else {
            this.state.loadingHint = loadingHint;
            this.state.isLoading = isLoading;
            this.state.showClose = showClose;
            this.state.time = time;
            this.state.cancelCallback = cancelCallback;
        }
    }

}

module.exports = MainDialogComponent;
