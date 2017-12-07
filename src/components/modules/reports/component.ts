import { ReportsComponentState } from './model/ComponentState';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { BreadcrumbDetails } from '@kix/core/dist/browser/router';
import { ComponentRouterStore } from '@kix/core/dist/browser/router/ComponentRouterStore';

class ReportsComponent {

    public state: ReportsComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new ReportsComponentState();
    }

    public onMount(): void {
        const contextId = ClientStorageHandler.getContextId();
        const breadcrumbDetails =
            new BreadcrumbDetails(contextId, null, null, 'Reports-Dashboard', null, null);
        ComponentRouterStore.getInstance().prepareBreadcrumbDetails(breadcrumbDetails);
    }

}

module.exports = ReportsComponent;
