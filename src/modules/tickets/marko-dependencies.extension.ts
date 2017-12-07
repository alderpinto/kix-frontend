import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class TicketsMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            'modules/tickets',
            'dialogs/ticket-creation',
            'ticket/ticket-search/ticket-search-result',
            'ticket/ticket-search/ticket-search-dialog-content',
            'ticket/ticket-details'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['tickets', 'modules/tickets'],
            ['ticket-table', 'base-components/ticket-table'],
            ['ticket-details', 'ticket/ticket-details'],
            ['ticket-creation', 'dialogs/ticket-creation'],
            ['ticket-search-result', 'ticket/ticket-search/ticket-search-result'],
            ['ticket-search-dialog-content', 'ticket/ticket-search/ticket-search-dialog-content']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new TicketsMarkoDependencyExtension();
};
