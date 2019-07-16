import {
    LabelService, ServiceRegistry, FactoryService, ContextService,
    ActionFactory, TableFactoryService, PlaceholderService
} from '../../../../core/browser';
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, WidgetConfiguration,
    ConfiguredDialogWidget
} from '../../../../core/model';
import { DialogService } from '../../../../core/browser/components/dialog';
import {
    OrganisationFormService, OrganisationTableFactory, OrganisationLabelProvider, OrganisationService,
    OrganisationBrowserFactory, OrganisationSearchDefinition, OrganisationSearchContext,
    OrganisationDetailsContext, OrganisationSearchAction, OrganisationCreateCIAction,
    OrganisationCreateTicketAction, OrganisationPlaceholderHandler
} from '../../../../core/browser/organisation';
import { KIXObjectSearchService } from '../../../../core/browser/kix/search/KIXObjectSearchService';
import { IUIModule } from '../../application/IUIModule';

export class UIModule implements IUIModule {

    public priority: number = 302;

    public unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        PlaceholderService.getInstance().registerPlaceholderHandler(new OrganisationPlaceholderHandler());

        ServiceRegistry.registerServiceInstance(OrganisationService.getInstance());
        ServiceRegistry.registerServiceInstance(OrganisationFormService.getInstance());

        TableFactoryService.getInstance().registerFactory(new OrganisationTableFactory());
        LabelService.getInstance().registerLabelProvider(new OrganisationLabelProvider());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.ORGANISATION, OrganisationBrowserFactory.getInstance()
        );
        KIXObjectSearchService.getInstance().registerSearchDefinition(new OrganisationSearchDefinition());

        this.registerContexts();
        this.registerDialogs();
        this.registerActions();
    }

    private registerContexts(): void {
        const organisationDetailsContext = new ContextDescriptor(
            OrganisationDetailsContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.MAIN, ContextMode.DETAILS,
            true, 'object-details-page', ['organisations'], OrganisationDetailsContext
        );
        ContextService.getInstance().registerContext(organisationDetailsContext);

        const searchContactContext = new ContextDescriptor(
            OrganisationSearchContext.CONTEXT_ID, [KIXObjectType.ORGANISATION], ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-organisation-dialog', ['organisations'], OrganisationSearchContext
        );
        ContextService.getInstance().registerContext(searchContactContext);
    }

    private registerDialogs(): void {
        DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-organisation-dialog',
            new WidgetConfiguration(
                'search-organisation-dialog', 'Translatable#Organisation Search', [], {},
                false, false, 'kix-icon-search-man-house'
            ),
            KIXObjectType.ORGANISATION,
            ContextMode.SEARCH
        ));
    }

    private registerActions(): void {
        ActionFactory.getInstance().registerAction('organisation-search-action', OrganisationSearchAction);
        ActionFactory.getInstance().registerAction('organisation-create-ci-action', OrganisationCreateCIAction);
        ActionFactory.getInstance().registerAction('organisation-create-ticket-action', OrganisationCreateTicketAction);
    }

}
