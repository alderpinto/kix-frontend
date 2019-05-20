import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

    public initComponentId: string = 'faq-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['faq-module-component', 'faq/faq-module-component'],
        ['faq', 'faq/faq-module'],
        ['faq-vote-selector', 'faq/faq-vote-selector'],
        ['new-faq-article-dialog', 'faq/dialogs/new-faq-article-dialog'],
        ['edit-faq-article-dialog', 'faq/dialogs/edit-faq-article-dialog'],
        ['search-faq-article-dialog', 'faq/dialogs/search-faq-article-dialog'],
        ['faq-category-input', 'faq/dialogs/inputs/faq-category-input'],
        ['faq-visibility-input', 'faq/dialogs/inputs/faq-visibility-input'],
        ['faq-article-info-widget', 'faq/widgets/faq-article-info-widget'],
        ['faq-article-content-widget', 'faq/widgets/faq-article-content-widget'],
        ['faq-article-history-widget', 'faq/widgets/faq-article-history-widget'],
        ['faq-article-list-widget', 'faq/widgets/faq-article-list-widget'],
        ['faq-category-explorer', 'faq/widgets/faq-category-explorer'],
        ['faq-admin-categories', 'faq/admin/faq-admin-categories'],
        ['new-faq-category-dialog', 'faq/admin/dialogs/new-faq-category-dialog'],
        ['edit-faq-category-dialog', 'faq/admin/dialogs/edit-faq-category-dialog'],
        ['faq-category-info-widget', 'faq/admin/widgets/faq-category-info-widget']
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
