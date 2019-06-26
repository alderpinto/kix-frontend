import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize,
    FormField, Form, FormContext, KIXObjectType, TableWidgetSettings, CRUD, KIXObjectLoadingOptions
} from '../../core/model';
import { SearchProperty, TableConfiguration, TableHeaderHeight, TableRowHeight } from '../../core/browser';
import { FAQArticleProperty } from '../../core/model/kix/faq';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { FAQContext } from '../../core/browser/faq/context/FAQContext';

export class DashboardModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const articleListWidget =
            new ConfiguredWidget('20180727-faq-article-list-widget',
                new WidgetConfiguration(
                    'table-widget', 'Translatable#Overview FAQ', ['faq-article-create-action', 'csv-export-action'],
                    new TableWidgetSettings(
                        KIXObjectType.FAQ_ARTICLE, null,
                        new TableConfiguration(
                            KIXObjectType.FAQ_ARTICLE,
                            new KIXObjectLoadingOptions(null, null, null, [FAQArticleProperty.VOTES])
                            , 25, null, true, null, null, null,
                            TableHeaderHeight.LARGE, TableRowHeight.LARGE
                        )
                    ),
                    false, false, 'kix-icon-faq', true
                ),
                [new UIComponentPermission('faq/articles', [CRUD.READ])]
            );

        const content = ['20180727-faq-article-list-widget'];
        const contentWidgets = [articleListWidget];

        const faqCategoryExplorer =
            new ConfiguredWidget('20180625-faq-category-explorer',
                new WidgetConfiguration(
                    'faq-category-explorer', 'Translatable#FAQ Categories', [], {},
                    false, false, 'kix-icon-faq', false
                ),
                [new UIComponentPermission('system/faq/categories', [CRUD.READ])]
            );

        const explorer = ['20180625-faq-category-explorer'];
        const explorerWidgets: Array<ConfiguredWidget<any>> = [faqCategoryExplorer];

        const notesSidebar =
            new ConfiguredWidget('20180726-faq-notes', new WidgetConfiguration(
                'notes-widget', 'Translatable#Notes', [], {},
                false, false, 'kix-icon-note', false)
            );

        const sidebars = ['20180726-faq-notes'];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [notesSidebar];

        return new ContextConfiguration(
            this.getModuleId(),
            sidebars, sidebarWidgets,
            explorer, explorerWidgets,
            [], [],
            content, contentWidgets
        );
    }

    // tslint:disable:max-line-length
    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();
        const linkFormId = 'link-faq-search-form';
        const existingLinkForm = configurationService.getModuleConfiguration(linkFormId, null);
        if (!existingLinkForm) {
            const fields: FormField[] = [];
            fields.push(new FormField("Translatable#Full Text", SearchProperty.FULLTEXT, null, false, "Translatable#Searchable FAQ attributes: FAQ#, Title, Symptom, Cause, Solution, Comment, Changed by, Created by, Keywords, Language, Validity"));
            fields.push(new FormField("Translatable#FAQ#", FAQArticleProperty.NUMBER, null, false, "Translatable#Search for FAQ articles with the same title or part of the same title (min. 1 character)."));
            fields.push(new FormField('Translatable#Title', FAQArticleProperty.TITLE, null, false, "Translatable#Search for FAQ articles with the same number or part of the same number (min. 1 character)."));
            fields.push(new FormField(
                "Category", FAQArticleProperty.CATEGORY_ID, 'faq-category-input', false, "Translatable#Search for FAQ articles within the choosen category.")
            );
            fields.push(new FormField('Validity', FAQArticleProperty.VALID_ID, 'valid-input', false, "Translatable#Search for FAQ articles within the choosen validity."));

            const attributeGroup = new FormGroup('Translatable#FAQ Attributes', fields);

            const form = new Form(
                linkFormId, 'Translatable#Link FAQ with', [attributeGroup],
                KIXObjectType.FAQ_ARTICLE, false, FormContext.LINK, null, true
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }

        configurationService.registerForm(
            [FormContext.LINK], KIXObjectType.FAQ_ARTICLE, linkFormId
        );
    }

}

module.exports = (data, host, options) => {
    return new DashboardModuleFactoryExtension();
};
