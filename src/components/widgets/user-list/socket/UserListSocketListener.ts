import { LoadUsersRequest } from './../../../../model/client/socket/users/LoadUsersRequest';
import { LoadUsersResult, UsersEvent } from './../../../../model/client/socket/users/';
import { SocketEvent } from '../../../../model/client/socket/SocketEvent';
import { LocalStorageHandler } from '../../../../model/client/LocalStorageHandler';
import {
    USER_LIST_USERS_LOADED,
    USER_LIST_ERROR
} from '../store/actions';

declare var io;

export class UserListSocketListener {

    private usersSocket: SocketIO.Server;

    private store: any;

    public constructor(store: any) {
        const token = LocalStorageHandler.getToken();
        const socketUrl = LocalStorageHandler.getFrontendSocketUrl();
        this.usersSocket = io.connect(socketUrl + "/users", {
            query: "Token=" + token
        });

        this.store = store;
        this.initUsersSocketListener();
    }

    public loadUsers(loadUsersRequest: LoadUsersRequest): void {
        this.usersSocket.emit(UsersEvent.LOAD_USERS, loadUsersRequest);
    }

    private initUsersSocketListener(): void {
        this.usersSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(USER_LIST_ERROR(null));
        });

        this.usersSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(USER_LIST_ERROR(String(error)));
        });

        this.usersSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(USER_LIST_ERROR('Timeout!'));
        });

        this.usersSocket.on('error', (error) => {
            this.store.dispatch(USER_LIST_ERROR(String(error)));
        });

        this.usersSocket.on(UsersEvent.USERS_LOADED, (result: LoadUsersResult) => {
            this.store.dispatch(USER_LIST_USERS_LOADED(result));
        });
    }
}
