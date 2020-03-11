/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { StringContent } from '../../../../../modules/base-components/webapp/core/StringContent';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { IdService } from '../../../../../model/IdService';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

class Component {

    private state: ComponentState;
    private listenerId: string;
    private isHintOverlay: boolean;
    private content: StringContent<any> | ComponentContent<any>;
    private instanceId: string;
    private title: string;
    private large: boolean;
    private icon: string | ObjectIcon;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.isHintOverlay = input.isHint || false;
        this.large = typeof input.large !== 'undefined' ? input.large : false;
        if (this.isHintOverlay) {
            this.content = new StringContent(input.content);
        } else {
            this.content = new ComponentContent(input.content, input.data);
        }

        this.instanceId = input.instanceId;
        this.title = input.title;
        this.icon = input.icon;
    }

    public onMount(): void {
        this.listenerId = IdService.generateDateBasedId('icon-');
        OverlayService.getInstance().registerOverlayListener(this.listenerId, this);
    }

    public onDestroy(): void {
        OverlayService.getInstance().unregisterOverlayListener(this.listenerId);
    }

    public showOverlay(event: any) {
        if (!this.state.show) {
            OverlayService.getInstance().openOverlay(
                this.isHintOverlay ? OverlayType.HINT : OverlayType.INFO,
                this.instanceId,
                this.content,
                this.title,
                this.icon,
                false,
                [
                    event.target.getBoundingClientRect().left + BrowserUtil.getBrowserFontsize(),
                    event.target.getBoundingClientRect().top
                ],
                this.listenerId,
                this.large
            );
        }
    }

    public getOverlayClasses(): string {
        let classes = 'kix-icon-icircle';
        if (this.isHintOverlay) {
            classes = 'kix-icon-question hint-icon';
        }
        return classes;
    }

    public overlayOpened(): void {
        this.state.show = true;
    }

    public overlayClosed(): void {
        this.state.show = false;
    }

}

module.exports = Component;
