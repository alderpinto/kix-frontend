/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { AgentPortalConfiguration as AgentPortalConfiguration } from '../../model/configuration/AgentPortalConfiguration';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'AgentPortal';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        return [new AgentPortalConfiguration()];
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
