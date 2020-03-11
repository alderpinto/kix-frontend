/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import addrparser = require('address-rfc2822');
import { FormValidationService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/FormValidationService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('EmailValidation', () => {

    describe('Validate email addresses with FormValidationService.', () => {

        it('Should check email addresses correctly.', () => {
            const validEmails = [
                'foo@bar.com', 'foo <foo@bar.com>', 'foo bar <foo@bar.com>',
                "'foo' <foo@bar.com>", '"foo" <foo@bar.com>', '#foo# <foo@bar.com>',
                'test.foo@bar.com', '"test..foo"@bar.com', 'f@bar.com',
                'test-foo@bar.com', 'test+foo@bar.com', 'test#foo@bar.com',
                '"test via foo" <foo@bar.com>'
            ];
            validEmails.forEach((email) => {
                expect(
                    FormValidationService.getInstance().isValidEmail(email),
                    'should be a valid mail'
                ).is.true;
            });

            expect(
                FormValidationService.getInstance().isValidEmail(''),
                'empty string should not be a valid email'
            ).is.false;
            expect(
                FormValidationService.getInstance().isValidEmail('test'),
                'simple string should not be a valid email'
            ).is.false;
            expect(
                FormValidationService.getInstance().isValidEmail('<foo> <foo@bar.com>'),
                'email with < and > for phrase should be invalid'
            ).is.false;
            expect(
                FormValidationService.getInstance().isValidEmail('foo foo@bar.com'),
                'email without < and > for address should be invalid'
            ).is.false;
            expect(
                FormValidationService.getInstance().isValidEmail('test <foo> <foo@bar.com>'),
                'email with unusual syntax should be invalid'
            ).is.false;
        });
    });

});

