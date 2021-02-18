/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { FAQContext } from '../../core/context/FAQContext';
import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = (await ContextService.getInstance().getContext(FAQContext.CONTEXT_ID) as FAQContext);
        const widgets = context.getContent();
        this.state.contentWidgets = widgets ? widgets.filter((w) => Boolean(w.configuration)) : [];
        if (!context.categoryId) {
            context.setFAQCategoryId(null);
        }
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }

}

module.exports = Component;
