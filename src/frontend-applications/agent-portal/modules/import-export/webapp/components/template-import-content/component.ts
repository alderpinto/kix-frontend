/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TableFactoryService } from '../../../../base-components/webapp/core/table';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.template = input.template;
    }

    public async onMount(): Promise<void> {
        if (this.state.template) {
            await this.prepareTable();
        }
    }

    public onDestroy(): void {
        if (this.state.template) {
            TableFactoryService.getInstance().destroyTable('import-export-template-' + this.state.template.ID);
            const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
            if (context) {
                context.deleteObjectList('RUNS_OF_TEMPLATE_' + this.state.template.ID);
            }
        }
    }

    private async prepareTable(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        if (context) {
            context.setObjectList(
                'RUNS_OF_TEMPLATE_' + this.state.template.ID, this.state.template.Runs ? this.state.template.Runs : []
            );
            const table = await TableFactoryService.getInstance().createTable(
                'import-export-template-' + this.state.template.ID + '-runs',
                KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN, null,
                // use template id
                [this.state.template.ID], context.getDescriptor().contextId
            );

            this.state.table = table;
        }
    }

}

module.exports = Component;
