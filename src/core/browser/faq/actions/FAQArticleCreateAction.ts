import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class FAQArticleCreateAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New FAQ';
        this.icon = 'kix-icon-new-faq';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.FAQ_ARTICLE, ContextMode.CREATE, null, true,
            undefined, undefined, 'new-faq-article-form'
        );
    }

}
