import { UsersCommunicator } from '../UsersCommunicator';
import { ICommunicatorExtension } from '@kix/core/dist/extensions';

export class UsersCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return UsersCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new UsersCommunicatorExtension();
};
