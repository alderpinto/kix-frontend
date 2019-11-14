/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { FormInstance, KIXObjectType, FormContext, FormFieldValue } from '../../../src/core/model';
import { FormConfiguration, FormFieldConfiguration, FormPageConfiguration, FormGroupConfiguration } from '../../../src/core/model/components/form/configuration';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Browser / Components / FormInstance - Order', () => {

    describe('change order of form fields', () => {

        let formInstance: FormInstance;
        beforeEach(async () => {
            const form = someTestFunctions.getForm();
            formInstance = new FormInstance(form);
        });

        it('Should correctly change field position to first position', async () => {
            const fieldId = formInstance.getForm().pages[0].groups[0].formFields[5].id;
            const fieldInstanceId = formInstance.getForm().pages[0].groups[0].formFields[5].instanceId;
            const fieldId_2 = formInstance.getForm().pages[0].groups[0].formFields[2].id;

            await formInstance.changeFieldOrder(fieldInstanceId, 0);

            const firstFieldId = formInstance.getForm().pages[0].groups[0].formFields[0].id;
            expect(fieldId).equal(firstFieldId);

            const firstFieldId_3 = formInstance.getForm().pages[0].groups[0].formFields[3].id;
            expect(fieldId_2, 'Former second field should now be 3rd field.').equal(firstFieldId_3);
        });

        it('Should correctly change field position prior current position', async () => {
            const fieldId = formInstance.getForm().pages[0].groups[0].formFields[5].id;
            const fieldInstanceId = formInstance.getForm().pages[0].groups[0].formFields[5].instanceId;
            const fieldId_1 = formInstance.getForm().pages[0].groups[0].formFields[1].id;
            const fieldId_2 = formInstance.getForm().pages[0].groups[0].formFields[2].id;
            const fieldId_7 = formInstance.getForm().pages[0].groups[0].formFields[7].id;

            await formInstance.changeFieldOrder(fieldInstanceId, 2);

            const priorFieldId = formInstance.getForm().pages[0].groups[0].formFields[2].id;
            expect(fieldId).equal(priorFieldId);

            const firstFieldId_1 = formInstance.getForm().pages[0].groups[0].formFields[1].id;
            expect(fieldId_1, 'Former first field should not changed its position.').equal(firstFieldId_1);

            const firstFieldId_3 = formInstance.getForm().pages[0].groups[0].formFields[3].id;
            expect(fieldId_2, 'Former second field should now be 3rd field.').equal(firstFieldId_3);

            const firstFieldId_7 = formInstance.getForm().pages[0].groups[0].formFields[7].id;
            expect(fieldId_7, 'Former 7th field should not changed its position.').equal(firstFieldId_7);
        });

        it('Should correctly change field position to last position', async () => {
            const fieldId = formInstance.getForm().pages[0].groups[0].formFields[5].id;
            const fieldInstanceId = formInstance.getForm().pages[0].groups[0].formFields[5].instanceId;
            const fieldId_7 = formInstance.getForm().pages[0].groups[0].formFields[7].id;

            const lastPositionIndex = formInstance.getForm().pages[0].groups[0].formFields.length - 1;
            await formInstance.changeFieldOrder(fieldInstanceId, lastPositionIndex);

            const lastFieldId = formInstance.getForm().pages[0].groups[0].formFields[lastPositionIndex].id;
            expect(fieldId).equal(lastFieldId);

            const firstFieldId_6 = formInstance.getForm().pages[0].groups[0].formFields[6].id;
            expect(fieldId_7, 'Former 7th field should now be 6th field.').equal(firstFieldId_6);
        });

        it('Should correctly change field position after current position', async () => {
            const fieldId = formInstance.getForm().pages[0].groups[0].formFields[5].id;
            const fieldInstanceId = formInstance.getForm().pages[0].groups[0].formFields[5].instanceId;
            const fieldId_1 = formInstance.getForm().pages[0].groups[0].formFields[1].id;
            const fieldId_6 = formInstance.getForm().pages[0].groups[0].formFields[6].id;
            const fieldId_7 = formInstance.getForm().pages[0].groups[0].formFields[7].id;
            const fieldId_9 = formInstance.getForm().pages[0].groups[0].formFields[9].id;

            await formInstance.changeFieldOrder(fieldInstanceId, 7);

            const afterFieldId = formInstance.getForm().pages[0].groups[0].formFields[7].id;
            expect(fieldId).equal(afterFieldId);

            const firstFieldId_1 = formInstance.getForm().pages[0].groups[0].formFields[1].id;
            expect(fieldId_1, 'Former first field should not changed its position.').equal(firstFieldId_1);

            const firstFieldId_5 = formInstance.getForm().pages[0].groups[0].formFields[5].id;
            expect(fieldId_6, 'Former 6th field should now be 5th field.').equal(firstFieldId_5);

            const firstFieldId_6 = formInstance.getForm().pages[0].groups[0].formFields[6].id;
            expect(fieldId_7, 'Former 7th field should now be 6th field.').equal(firstFieldId_6);

            const firstFieldId_9 = formInstance.getForm().pages[0].groups[0].formFields[9].id;
            expect(fieldId_9, 'Former 9th field should not changed its position.').equal(firstFieldId_9);
        });

        it('Should correctly change field position after current (index 1000 => last position)', async () => {
            const fieldId = formInstance.getForm().pages[0].groups[0].formFields[5].id;
            const fieldInstanceId = formInstance.getForm().pages[0].groups[0].formFields[5].instanceId;

            const lastPositionIndex = formInstance.getForm().pages[0].groups[0].formFields.length - 1;

            await formInstance.changeFieldOrder(fieldInstanceId, 1000);

            const lastFieldId = formInstance.getForm().pages[0].groups[0].formFields[lastPositionIndex].id;
            expect(fieldId).equal(lastFieldId);
        });

        it('Should not change order (unknown field)', async () => {
            const fieldId = formInstance.getForm().pages[0].groups[0].formFields[5].id;

            await formInstance.changeFieldOrder('unknown', 2);

            const priorFieldId = formInstance.getForm().pages[0].groups[0].formFields[5].id;
            expect(fieldId).equal(priorFieldId);
        });

        it('Should also moved children field', async () => {
            const field = formInstance.getForm().pages[0].groups[0].formFields[5];
            const fieldChildId = field.children[0].id;

            await formInstance.changeFieldOrder(field.instanceId, 2);

            const priorFieldChildId = formInstance.getForm().pages[0].groups[0].formFields[2].children[0].id;
            expect(fieldChildId).equal(priorFieldChildId);
        });

        it('Should also sort form values', async () => {
            await formInstance.initFormInstance();

            const field = formInstance.getForm().pages[0].groups[0].formFields[5];
            const fieldChildInstanceId = field.children[field.children.length - 1].instanceId;

            const valueMap = formInstance.getAllFormFieldValues();
            const valueIndex = Array.from(valueMap.keys()).findIndex((ids) => ids === fieldChildInstanceId);

            await formInstance.changeFieldOrder(field.instanceId, 1000);

            const valueMapAfter = formInstance.getAllFormFieldValues();
            const valueIndexAfter = Array.from(valueMapAfter.keys()).findIndex((ids) => ids === fieldChildInstanceId);

            expect(valueIndex, 'Values are not reordered.').not.equal(valueIndexAfter);
            expect(valueIndexAfter, 'Value of last child of last field should be last value in value list').equal(Array.from(valueMapAfter.keys()).length - 1);
        });

    });

});

class someTestFunctions {
    public static getForm(): FormConfiguration {

        const fields = [...Array(10)].map((v, i) => {
            const children = [...Array(5)].map((v, e) => {
                return new FormFieldConfiguration(
                    `field-${i}-${e}`, `field-${i}-${e}`, 'something', null, false, undefined, undefined, new FormFieldValue(`field-${i}-${e}`)
                );
            });
            return new FormFieldConfiguration(
                `field-${i}`, `field-${i}`, 'something', null, false, undefined, undefined, new FormFieldValue(`field-${i}`),
                children.map((c) => c.id), children
            );
        });

        return new FormConfiguration(
            'order-test', 'Order Test', ['order-test-page'],
            KIXObjectType.ANY, false, undefined, undefined,
            [
                new FormPageConfiguration(
                    'order-test-page', 'Order Test Page', ['order-test-group'], false, false,
                    [
                        new FormGroupConfiguration(
                            'order-test-group', 'Order-Test-Group', fields.map((f) => f.id),
                            undefined, fields
                        )
                    ]
                )
            ]
        );
    }
}
