import { ClientStorageHandler, TranslationHandler } from '@kix/core/dist/model/client';
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';
import { CreationDialogComponentEvent } from '@kix/core/dist/model/client/components';

import { TicketCreationDialogState } from './model/TicketCreationDialogState';
import { TranslationId } from './model/TranslationId';

import { ComponentId } from './model/ComponentId';

class TicketCreationDialogComponent {

    public state: TicketCreationDialogState;

    private closeDialogAfterSuccess: boolean;

    public onCreate(input: any): void {
        this.state = new TicketCreationDialogState();
        this.closeDialogAfterSuccess = true;
    }

    public async onMount(): Promise<void> {
        this.state = new TicketCreationDialogState();
        const existingState = ClientStorageHandler.loadState(TicketStore.TICKET_CREATION_STATE_ID);

        TicketStore.addStateListener(this.stateChanged.bind(this));

        const translationHandler = await TranslationHandler.getInstance();
        const questionString = translationHandler.getTranslation(TranslationId.LOAD_DRAFT_QUESTION);

        if (existingState && !confirm(questionString)) {
            ClientStorageHandler.deleteState(TicketStore.TICKET_CREATION_STATE_ID);
            TicketStore.resetTicketCreation().then(() => {
                TicketStore.loadTicketData(ComponentId.TICKET_CREATION_DATA_ID);
            });
        } else {
            TicketStore.loadTicketData(ComponentId.TICKET_CREATION_DATA_ID);
        }
    }

    public onInput(input: any) {
        this.state.createNewObjectAfterFinish = input.createNewObjectAfterFinish;
    }

    public stateChanged(): void {
        const ticketDataState = TicketStore.getTicketData(ComponentId.TICKET_CREATION_DATA_ID);
        const ticketCreationState = TicketStore.getTicketCreationState();

        this.state.error = ticketCreationState.error;
    }

    public createTicket(): void {
        TicketStore.createTicket().then(() => {
            if (this.state.createNewObjectAfterFinish) {
                TicketStore.resetTicketCreation();
                TicketStore.loadTicketData(ComponentId.TICKET_CREATION_DATA_ID);
                this.state.error = null;
            }
            (this as any).emit(CreationDialogComponentEvent.FINISH_DIALOG);
        }).catch((error) => {
            this.state.error = error;
        });
    }
}

module.exports = TicketCreationDialogComponent;
