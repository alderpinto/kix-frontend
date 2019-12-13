/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export * from './context';
export * from './table';
export * from './actions';

export { ContactService } from './ContactService';
export { ContactFormService } from './ContactFormService';
export { ContactLabelProvider } from './ContactLabelProvider';
export { ContactBrowserFactory } from './ContactBrowserFactory';
export { ContactSearchDefinition } from './ContactSearchDefinition';
export { ContactPlaceholderHandler } from './ContactPlaceholderHandler';
export { ContactDialogUtil } from './ContactDialogUtil';

export { OrganisationService } from './OrganisationService';
export { OrganisationLabelProvider } from './OrganisationLabelProvider';
export { OrganisationBrowserFactory } from './OrganisationBrowserFactory';
export { OrganisationSearchDefinition } from './OrganisationSearchDefinition';
export { OrganisationFormService } from './OrganisationFormService';
export { OrganisationImportManager } from './OrganisationImportManager';
export { OrganisationPlaceholderHandler } from './OrganisationPlaceholderHandler';
export { OrganisationDialogUtil } from './OrganisationDialogUtil';

export { UIModule as CustomerUIModule } from './CustomerUIModule';
export { UIModule as ContactEditUIModule } from './ContactEditUIModule';
export { UIModule as ContactReadUIModule } from './ContactReadUIModule';
export { UIModule as OrganisationEditUIModule } from './OrganisationEditUIModule';
export { UIModule as OrganisationReadUIModule } from './OrganisationReadUIModule';