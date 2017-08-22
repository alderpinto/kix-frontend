import { container } from './../../src/Container';
import { IConfigurationService } from './../../src/services/';
import { IServerConfiguration } from './../../src/model/';
import * as chai from 'chai';

const expect = chai.expect;

const configurationService: IConfigurationService = container.get<IConfigurationService>("IConfigurationService");

/* tslint:disable:no-unused-expression*/
describe('Server Configuration', () => {

    const serverConfiguration: IServerConfiguration = configurationService.getServerConfiguration();

    it('Should exists', () => {
        expect(serverConfiguration).to.not.be.undefined;
    });

    it('Should contain SERVER_PORT as type of number.', () => {
        expect(serverConfiguration.SERVER_PORT).to.not.be.undefined;
        expect(serverConfiguration.SERVER_PORT).to.be.an('number');
    });

    it('Should contain SOCKET_COMMUNICATION_PORT as type of number.', () => {
        expect(serverConfiguration.SOCKET_COMMUNICATION_PORT).to.not.be.undefined;
        expect(serverConfiguration.SOCKET_COMMUNICATION_PORT).to.be.an('number');
    });

    it('Should contain PLUGIN_FOLDERS as type of array', () => {
        expect(serverConfiguration.PLUGIN_FOLDERS).to.not.be.undefined;
        expect(serverConfiguration.PLUGIN_FOLDERS).to.be.an('array');
    });

    it('Should contain BACKEND_API_URL as type of string', () => {
        expect(serverConfiguration.BACKEND_API_URL).to.not.be.undefined;
        expect(serverConfiguration.BACKEND_API_URL).to.be.an('string');
        expect(serverConfiguration.BACKEND_API_URL).to.not.be.empty;
    });
});
