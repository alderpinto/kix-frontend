/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { RoutingConfiguration } from '../../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../../model/ContextMode';
import { ContextHistory } from '../../../../../base-components/webapp/core/ContextHistory';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Personal Settings', 'Translatable#Switch to customer portal.',
            'Translatable#Help', 'Translatable#Logout'
        ]);

        window.addEventListener('resize', this.resizeHandling.bind(this), false);
        this.resizeHandling();
    }


    public onDestroy(): void {
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
    }

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= 1024);
    }

    public showPersonalSettings(): void {
        ContextService.getInstance().setActiveContext('personal-settings-dialog-context');
    }

    public getReleaseRoutingConfig(): RoutingConfiguration {
        return new RoutingConfiguration(
            'release', null, ContextMode.DASHBOARD, null
        );
    }

    public async logout(): Promise<void> {
        ContextHistory.getInstance().removeBrowserListener();
        window.location.replace('/auth/logout');
    }

}

module.exports = Component;
