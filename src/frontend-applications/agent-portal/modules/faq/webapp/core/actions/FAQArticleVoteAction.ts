/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from "../../../../../modules/base-components/webapp/core/AbstractAction";

import { UIComponentPermission } from "../../../../../model/UIComponentPermission";

import { CRUD } from "../../../../../../../server/model/rest/CRUD";

import { OverlayService } from "../../../../../modules/base-components/webapp/core/OverlayService";

import { OverlayType } from "../../../../../modules/base-components/webapp/core/OverlayType";

import { ComponentContent } from "../../../../../modules/base-components/webapp/core/ComponentContent";

export class FAQArticleVoteAction extends AbstractAction {

    public hasLink: boolean = false;

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('faq/articles/*/votes', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Rate';
        this.icon = 'kix-icon-star-fully';
    }

    public async run(event: any): Promise<void> {
        if (this.data && Array.isArray(this.data) && this.data.length) {
            const faqArticle = this.data[0];

            OverlayService.getInstance().openOverlay(
                OverlayType.CONTENT_OVERLAY,
                'faq-vote-action-overlay',
                new ComponentContent('faq-vote-selector', { faqArticle }),
                'Translatable#FAQ rating',
                false,
                [
                    event.target.getBoundingClientRect().left,
                    event.target.getBoundingClientRect().top
                ],
                'faq-vote-action-overlay'
            );
        }
    }

}
