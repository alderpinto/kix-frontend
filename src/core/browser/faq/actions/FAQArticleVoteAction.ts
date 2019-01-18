import { AbstractAction, OverlayType, ComponentContent } from "../../../model";
import { EventService } from "../../event";
import { FAQEvent } from "../FAQEvent";
import { OverlayService } from "../../OverlayService";

export class FAQArticleVoteAction extends AbstractAction {

    public initAction(): void {
        this.text = "Bewerten";
        this.icon = "kix-icon-star-fully";
    }

    public run(event: any): void {
        if (this.data && Array.isArray(this.data) && this.data.length) {
            const faqArticle = this.data[0];

            OverlayService.getInstance().openOverlay(
                OverlayType.CONTENT_OVERLAY,
                'faq-vote-action-overlay',
                new ComponentContent('faq-vote-selector', { faqArticle }),
                'FAQ-Bewertung',
                false,
                [
                    event.target.getBoundingClientRect().left + window.scrollX,
                    event.target.getBoundingClientRect().top + window.scrollY
                ],
                'faq-vote-action-overlay'
            );
        }
    }

}
