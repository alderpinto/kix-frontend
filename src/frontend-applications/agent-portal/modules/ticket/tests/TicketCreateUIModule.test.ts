/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ContextFactory } from '../../base-components/webapp/core/ContextFactory';
import { TicketCreateUIModule, NewTicketDialogContext } from '../webapp/core';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('TicketCreateUIModule', () => {

    let ticketModule: TicketCreateUIModule;

    before(() => {
        ticketModule = new TicketCreateUIModule();
    });

    describe('Should register the create module for ticket', () => {

        it('should register', async () => {
            await ticketModule.register();
        });

        it('should register the context for NewTicketDialogContext', () => {
            const descriptor = ContextFactory.getInstance().getContextDescriptor(NewTicketDialogContext.CONTEXT_ID);
            expect(descriptor).exist;
        });

        it('should register TicketCreateAction', () => {
            expect(ActionFactory.getInstance().hasAction('ticket-create-action')).true;
        });

    });

});