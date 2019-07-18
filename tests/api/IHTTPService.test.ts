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
import { HttpService, ConfigurationService } from '../../src/core/services';
import { Error } from '../../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('HTTP Service', () => {
    let nockScope;
    let apiURL: string;

    before(async () => {
        require('../TestSetup');
        const nock = require('nock');
        apiURL = ConfigurationService.getInstance().getServerConfiguration().BACKEND_API_URL;
        nockScope = nock(apiURL);
    });

    it('Service instance is registered in container.', () => {
        expect(HttpService.getInstance()).exist;
    });

    describe('GET Requests', () => {

        before(() => {
            nockScope
                .get('/testGet')
                .reply(200, {});

            this.testObject = {
                id: '1234567890',
                name: 'test-object',
                description: 'test-object-description'
            };

            nockScope
                .get('/testGetObject')
                .reply(200, this.testObject);

            this.parameterObject = {
                id: "12345"
            };
            nockScope
                .get('/object')
                .query({ id: '12345' })
                .reply(200, this.parameterObject);

            nockScope
                .get('/unknownResource')
                .reply(404, new Error('404', 'Error', 404));
        });

        it('Should return an empty object.', async () => {
            const res = await HttpService.getInstance().get('testGet', {}, 'token', null, null, false);
            expect(res).exist;
            expect(res).deep.equal({});
        });

        it('Should return a object with properties.', async () => {
            const res = await HttpService.getInstance().get("testGetObject", {}, 'token', null, null, false);
            expect(res).deep.equal(this.testObject);
        });

        it('Should return a object with the values of the query parameter.', async () => {
            const res = await HttpService.getInstance().get('object', { id: '12345' }, 'token', null, null, false);
            expect(res).deep.equal(this.parameterObject);
        });

        it('Should return a correct http error if resource not exists.', async () => {
            const res = await HttpService.getInstance().get('unknownResource', {}, 'token', null, null, false)
                .catch((err: Error) => {
                    expect(err).exist;
                    expect(err).instanceof(Error);
                    expect(err.StatusCode).equal(404);
                });
        });
    });

    describe('POST Requests', () => {
        before(() => {
            nockScope
                .post('/post', {
                    name: 'testobject'
                })
                .reply(201, 'Object#12345');

            nockScope
                .post('/unknownResource')
                .reply(404, new Error('404', 'Error', 404));
        });

        it('Should return the id of the new created object.', async () => {
            const response: string = await HttpService.getInstance().post<string>("post", { name: 'testobject' }, '', null);
            expect(response).exist;
            expect(response).an('string');
            expect(response).equal('Object#12345');
        });

        it('Should return a correct http error if resource not exists.', async () => {
            const res = await HttpService.getInstance().post('unknownResource', {}, '', null)
                .catch((err: Error) => {
                    expect(err).exist;
                    expect(err).instanceof(Error);
                    expect(err.StatusCode).equal(404);
                });
        });
    });

    describe('PATCH Requests', () => {
        before(() => {
            nockScope
                .patch('/patch/12345', {
                    name: 'testobject'
                })
                .reply(200, 'Object#12345');

            nockScope
                .patch('/unknownResource', {
                    name: 'testobject'
                })
                .reply(404, new Error('404', 'Error', 404));
        });

        it('Should return the id of the patched object.', async () => {
            const response: string = await HttpService.getInstance().patch<string>("patch/12345", { name: 'testobject' }, '', null);
            expect(response).exist;
            expect(response).an('string');
            expect(response).equal('Object#12345');
        });

        it('Should return a correct http error if resource not exists.', async () => {
            const res = await HttpService.getInstance().patch('unknownResource', { name: 'testobject' }, '', null)
                .catch((err: Error) => {
                    expect(err).exist;
                    expect(err).instanceof(Error);
                    expect(err.StatusCode).equal(404);
                });
        });
    });

    describe('DELETE Requests', () => {
        before(() => {
            nockScope
                .delete('/delete/12345')
                .reply(204);

            nockScope
                .delete('/unknownResource')
                .reply(404, new Error('404', 'Error', 404));
        });

        it('Should return nothing if object is deleted.', async () => {
            const response = await HttpService.getInstance().delete("delete/12345", '', null);
            expect(response).undefined;
        });

        it('Should return a correct http error if resource not exists.', async () => {
            const res = await HttpService.getInstance().delete('unknownResource', '', null)
                .catch((err: Error) => {
                    expect(err).exist;
                    expect(err).instanceof(Error);
                    expect(err.StatusCode).equal(404);
                });
        });
    });
});
