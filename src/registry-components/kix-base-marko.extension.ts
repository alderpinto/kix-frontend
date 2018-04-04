import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class KIXMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            ...this.getTicketDependencies(),
            ...this.getFaqDependencies(),
            'quick-search',
            'cmdb/cmdb-module',
            'customers/customers-module',
            'home/home-module',
            'reports/reports-module',
            'search/search-module'
        ];
    }

    private getTicketDependencies(): string[] {
        return [
            'ticket/explorer/ticket-queue-explorer',
            'ticket/explorer/ticket-queue-explorer/ticket-queue-explorer-configuration',
            'ticket/explorer/ticket-service-explorer',
            'ticket/explorer/ticket-service-explorer/ticket-service-explorer-configuration',
            'ticket/ticket-module',
            'ticket/ticket-details',
            'ticket/ticket-dynamic-fields-container',
            'ticket/widgets/article-attachment-widget',
            'ticket/widgets/article-receiver-list-widget',
            'ticket/widgets/ticket-list-widget',
            'ticket/widgets/ticket-list-widget/ticket-list-configuration',
            'ticket/widgets/ticket-info-widget',
            'ticket/widgets/ticket-history-widget',
            'ticket/widgets/ticket-info-widget/ticket-info-configuration',
            'ticket/widgets/ticket-description-widget',
            'ticket/widgets/ticket-customer-info-widget',
            'ticket/widgets/ticket-contact-info-widget',
            'ticket/widgets/ticket-dynamic-fields-widget',
            'ticket/widgets/ticket-linked-objects-widget',
            'ticket/ticket-article-details',
            'ticket/ticket-article-attachment-list'
        ];
    }

    private getFaqDependencies(): string[] {
        return [
            'faq/faq-module'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ...this.getTicketComponentTags(),
            ...this.getFaqComponentTags(),
            ['cmdb', 'cmdb/cmdb-module'],
            ['customers', 'customers/customers-module'],
            ['home', 'home/home-module'],
            ['reports', 'reports/reports-module'],
            ['search', 'search/search-module'],
            ['icon', '_base-components/icon']
        ];
    }

    // tslint:disable:max-line-length
    private getTicketComponentTags(): Array<[string, string]> {
        const widgets: Array<[string, string]> = [
            ['article-attachment-widget', 'ticket/widgets/article-attachment-widget'],
            ['article-receiver-list-widget', 'ticket/widgets/article-receiver-list-widget'],
            ['ticket-list-widget', 'ticket/widgets/ticket-list-widget'],
            ['ticket-list-configuration', 'ticket/widgets/ticket-list-widget/ticket-list-configuration'],
            ['ticket-info-widget', 'ticket/widgets/ticket-info-widget'],
            ['ticket-info-configuration', 'ticket/widgets/ticket-info-widget/ticket-info-configuration'],
            ['ticket-history-widget', 'ticket/widgets/ticket-history-widget'],
            ['ticket-description-widget', 'ticket/widgets/ticket-description-widget'],
            ['ticket-customer-info-widget', 'ticket/widgets/ticket-customer-info-widget'],
            ['ticket-contact-info-widget', 'ticket/widgets/ticket-contact-info-widget'],
            ['ticket-dynamic-fields-widget', 'ticket/widgets/ticket-dynamic-fields-widget'],
            ['ticket-linked-objects-widget', 'ticket/widgets/ticket-linked-objects-widget'],
            ['ticket-dynamic-fields-container', 'ticket/ticket-dynamic-fields-container']
        ];

        const explorer: Array<[string, string]> = [
            ['ticket-queue-explorer', 'ticket/explorer/ticket-queue-explorer'],
            ['ticket-queue-explorer-configuration', 'ticket/explorer/ticket-queue-explorer/ticket-queue-explorer-configuration'],
            ['ticket-service-explorer', 'ticket/explorer/ticket-service-explorer'],
            ['ticket-service-explorer-configuration', 'ticket/explorer/ticket-service-explorer/ticket-service-explorer-configuration'],
        ];

        return [
            ['tickets', 'ticket/ticket-module'],
            ['ticket-article-attachment-list', 'ticket/ticket-article-attachment-list'],
            ['ticket-details', 'ticket/ticket-details'],
            ['ticket-table', 'ticket/ticket-table'],
            ['ticket-article-details', 'ticket/ticket-article-details'],
            ...widgets,
            ...explorer
        ];
    }

    private getFaqComponentTags(): Array<[string, string]> {
        return [
            ['faq', 'faq/faq-module']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new KIXMarkoDependencyExtension();
};
