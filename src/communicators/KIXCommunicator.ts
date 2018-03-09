import { inject, injectable } from 'inversify';
import {
    IAuthenticationService,
    IConfigurationService, IContactService, ICustomerService,
    IDynamicFieldService,
    IGeneralCatalogService,
    ILinkService,
    ILoggingService,
    IObjectIconService,
    IPluginService,
    IServiceService, ISysConfigService,
    ITicketService,
    ITranslationService,
    IUserService,
    IWidgetRepositoryService,
} from '@kix/core/dist/services';
import { SocketEvent } from '@kix/core/dist/model';
import { ICommunicator, IServerConfiguration } from '@kix/core/dist/common';

@injectable()
export abstract class KIXCommunicator implements ICommunicator {

    public constructor(
        @inject('IConfigurationService') protected configurationService: IConfigurationService,
        @inject('IAuthenticationService') protected authenticationService: IAuthenticationService,
        @inject('ILoggingService') protected loggingService: ILoggingService,
        @inject('IPluginService') protected pluginService: IPluginService,
        @inject('IUserService') protected userService: IUserService,
        @inject('ICustomerService') protected customerService: ICustomerService,
        @inject('IContactService') protected contactService: IContactService,
        @inject('ITranslationService') protected translationService: ITranslationService,
        @inject('ITicketService') protected ticketService: ITicketService,
        @inject('IServiceService') protected serviceService: IServiceService,
        @inject('IDynamicFieldService') protected dynamicFieldService: IDynamicFieldService,
        @inject('ISysConfigService') protected sysConfigService: ISysConfigService,
        @inject('IWidgetRepositoryService') protected widgetRepositoryService: IWidgetRepositoryService,
        @inject('IObjectIconService') protected objectIconService: IObjectIconService,
        @inject('IGeneralCatalogService') protected generalCatalogService: IGeneralCatalogService,
        @inject('ILinkService') protected linkService: ILinkService
    ) { }

    public abstract registerNamespace(socketIO: SocketIO.Server): void;
}
