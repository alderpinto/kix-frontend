import { ComponentState } from './ComponentState';
import { KIXObjectType, ContextMode } from '../../../../core/model';
import { FAQDetailsContext } from '../../../../core/browser/faq';
import { FAQArticleProperty } from '../../../../core/model/kix/faq';
import { RoutingConfiguration } from '../../../../core/browser/router';
import { AbstractNewDialog } from '../../../../core/browser/components/dialog';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create FAQ Article',
            'Translatable#FAQ Article successfully created.',
            KIXObjectType.FAQ_ARTICLE,
            new RoutingConfiguration(
                FAQDetailsContext.CONTEXT_ID, KIXObjectType.FAQ_ARTICLE,
                ContextMode.DETAILS, FAQArticleProperty.ID, true
            )
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

}

module.exports = Component;
