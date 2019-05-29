import { ComponentState } from './ComponentState';
import { KIXObjectType, ContextMode, ConfigItemClassProperty } from '../../../../../core/model';
import { RoutingConfiguration } from '../../../../../core/browser/router';
import { ConfigItemClassDetailsContext } from '../../../../../core/browser/cmdb';
import { AbstractNewDialog } from '../../../../../core/browser/components/dialog';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create CI Class',
            'Translatable#CI Class successfully created.',
            KIXObjectType.CONFIG_ITEM_CLASS,
            new RoutingConfiguration(
                ConfigItemClassDetailsContext.CONTEXT_ID,
                KIXObjectType.CONFIG_ITEM_CLASS,
                ContextMode.DETAILS,
                ConfigItemClassProperty.ID,
                true
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
