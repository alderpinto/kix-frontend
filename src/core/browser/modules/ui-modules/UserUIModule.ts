/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../application/IUIModule";
import { PlaceholderService } from "../../placeholder";
import { PermissionTableCSSHandler } from "../../application";
import { KIXObjectType, CRUD, ContextDescriptor, ContextMode, ContextType, } from "../../../model";
import { TableCSSHandlerRegistry, TableFactoryService } from "../../table";
import { ServiceRegistry, FactoryService } from "../../kix";
import { LabelService } from "../../LabelService";
import { PermissionTypeBrowserFactory } from "../../permission";
import { ActionFactory } from "../../ActionFactory";
import { ContextService } from "../../context";
import { AuthenticationSocketClient } from "../../application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../model/UIComponentPermission";
import {
    UserFormService, RoleService, UserPlaceholderHandler, UserLabelProvider, RoleLabelProvider,
    UserRoleFormService, RoleTableFactory, UserTableFactory, UserBrowserFactory, RoleBrowserFactory,
    UserCreateAction, NewUserDialogContext, UserEditAction, EditUserDialogContext, UserDetailsContext,
    UserRoleCreateAction, NewUserRoleDialogContext, UserRoleEditAction, EditUserRoleDialogContext, RoleDetailsContext
} from "../../user";

export class UIModule implements IUIModule {

    public priority: number = 50;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }


    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(new UserPlaceholderHandler());

        ServiceRegistry.registerServiceInstance(RoleService.getInstance());
        ServiceRegistry.registerServiceInstance(UserFormService.getInstance());

        LabelService.getInstance().registerLabelProvider(new UserLabelProvider());
        LabelService.getInstance().registerLabelProvider(new RoleLabelProvider());

        ServiceRegistry.registerServiceInstance(UserRoleFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new RoleTableFactory());
        TableFactoryService.getInstance().registerFactory(new UserTableFactory());
        TableCSSHandlerRegistry.getInstance().registerObjectCSSHandler(
            KIXObjectType.PERMISSION, new PermissionTableCSSHandler()
        );

        FactoryService.getInstance().registerFactory(KIXObjectType.USER, UserBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(KIXObjectType.ROLE, RoleBrowserFactory.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.PERMISSION_TYPE, PermissionTypeBrowserFactory.getInstance()
        );

        await this.registerUser();
        await this.registerRole();
    }

    private async registerUser(): Promise<void> {

        if (await this.checkPermission('system/users', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('user-admin-user-create-action', UserCreateAction);

            const newUserContext = new ContextDescriptor(
                NewUserDialogContext.CONTEXT_ID, [KIXObjectType.USER],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-user-dialog', ['users'], NewUserDialogContext
            );
            await ContextService.getInstance().registerContext(newUserContext);
        }

        if (await this.checkPermission('system/users/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('user-admin-user-edit-action', UserEditAction);

            const editUserContext = new ContextDescriptor(
                EditUserDialogContext.CONTEXT_ID, [KIXObjectType.USER],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-user-dialog', ['users'], EditUserDialogContext
            );
            await ContextService.getInstance().registerContext(editUserContext);
        }

        const userDetailsContextDescriptor = new ContextDescriptor(
            UserDetailsContext.CONTEXT_ID, [KIXObjectType.USER],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['users'], UserDetailsContext
        );
        await ContextService.getInstance().registerContext(userDetailsContextDescriptor);
    }

    private async registerRole(): Promise<void> {

        if (await this.checkPermission('system/roles', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('user-admin-role-create-action', UserRoleCreateAction);

            const newUserRoleContext = new ContextDescriptor(
                NewUserRoleDialogContext.CONTEXT_ID, [KIXObjectType.ROLE],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-user-role-dialog', ['roles'], NewUserRoleDialogContext
            );
            await ContextService.getInstance().registerContext(newUserRoleContext);
        }

        if (await this.checkPermission('system/roles/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('user-admin-role-edit-action', UserRoleEditAction);

            const editUserRoleContext = new ContextDescriptor(
                EditUserRoleDialogContext.CONTEXT_ID, [KIXObjectType.ROLE],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-user-role-dialog', ['roles'], EditUserRoleDialogContext
            );
            await ContextService.getInstance().registerContext(editUserRoleContext);
        }

        const roleDetailsContextDescriptor = new ContextDescriptor(
            RoleDetailsContext.CONTEXT_ID, [KIXObjectType.ROLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['roles'], RoleDetailsContext
        );
        await ContextService.getInstance().registerContext(roleDetailsContextDescriptor);
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }

}
