/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Article } from '../../../model/Article';
import { ICell } from '../../../../base-components/webapp/core/table';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';

class Component extends AbstractMarkoComponent<ComponentState> {

    private article: Article;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell: ICell = input.cell;
        if (cell) {
            this.article = cell.getRow().getRowObject().getObject();
            if (this.article && this.article.Attachments) {
                const attachments = this.article.Attachments.filter((a) => a.Disposition !== 'inline');
                this.state.show = attachments.length > 0;
                this.state.count = attachments.length;
            }
        }
    }

    public async onMount(): Promise<void> {
        return;
    }

    public attachmentClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        if (this.article) {
            const data = { article: this.article };

            OverlayService.getInstance().openOverlay(
                OverlayType.INFO,
                'article-attachment-widget',
                new ComponentContent('ticket-article-attachment-list', data, this.article),
                'Anlagen',
                null,
                false,
                [
                    event.target.getBoundingClientRect().left,
                    event.target.getBoundingClientRect().top
                ]
            );
        }

    }

}

module.exports = Component;
