/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IServiceExtension } from "../../server/extensions/IServiceExtension";
import { ContactAPIService } from "./server/ContactService";
import { OrganisationAPIService } from "./server/OrganisationService";

class Extension implements IServiceExtension {

    public async initServices(): Promise<void> {
        ContactAPIService.getInstance();
        OrganisationAPIService.getInstance();
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
