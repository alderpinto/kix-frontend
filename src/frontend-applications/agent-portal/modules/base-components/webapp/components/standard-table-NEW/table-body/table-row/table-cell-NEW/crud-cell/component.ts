/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent
} from '../../../../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Cell } from '../../../../../../core/table';
import { CRUD } from '../../../../../../../../../../../server/model/rest/CRUD';
import { LabelService } from '../../../../../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../../../../../../model/kix/KIXObjectType';
import { PermissionProperty } from '../../../../../../../../user/model/PermissionProperty';
import { Permission } from '../../../../../../../../user/model/Permission';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell: Cell = input.cell;
        if (cell) {
            const property = cell.getProperty();

            const permission: Permission = cell.getRow().getRowObject().getObject();
            const value: number = permission.Value;

            switch (property) {
                case PermissionProperty.CREATE:
                    this.prepareState(value, CRUD.CREATE, 'C');
                    break;
                case PermissionProperty.READ:
                    this.prepareState(value, CRUD.READ, 'R');
                    break;
                case PermissionProperty.UPDATE:
                    this.prepareState(value, CRUD.UPDATE, 'U');
                    break;
                case PermissionProperty.DELETE:
                    this.prepareState(value, CRUD.DELETE, 'D');
                    break;
                case PermissionProperty.DENY:
                    this.prepareState(value, CRUD.DENY, 'DN');
                    this.state.deny = true;
                    break;
                default:
            }
            this.update(property);
        }

    }

    private async update(property: string): Promise<void> {
        this.state.tooltip = await LabelService.getInstance().getPropertyText(
            property, KIXObjectType.PERMISSION, false, false
        );
    }

    private prepareState(value: number, crud: CRUD, optionText: string): void {
        this.state.active = Boolean(value & crud);
        this.state.optionText = optionText;
    }

}

module.exports = Component;
