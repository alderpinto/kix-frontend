/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { TableConfigurationResolver } from './TableConfigurationResolver';
import { IConfigurationResolver } from './IConfigurationResolver';
import { TableWidgetConfiguration } from '../../../model/configuration/TableWidgetConfiguration';

import { SysConfigOption } from '../../../modules/sysconfig/model/SysConfigOption';

export class TableWidgetConfigurationResolver implements IConfigurationResolver<TableWidgetConfiguration> {

    private static INSTANCE: TableWidgetConfigurationResolver;

    public static getInstance(): TableWidgetConfigurationResolver {
        if (!TableWidgetConfigurationResolver.INSTANCE) {
            TableWidgetConfigurationResolver.INSTANCE = new TableWidgetConfigurationResolver();
        }
        return TableWidgetConfigurationResolver.INSTANCE;
    }

    private constructor() { }

    public async resolve(
        token: string, configuration: TableWidgetConfiguration, sysConfigOptions: SysConfigOption[]
    ): Promise<void> {
        if (configuration) {
            if (configuration.subConfigurationDefinition) {

                const tableOption = sysConfigOptions.find(
                    (o) => o.Name === configuration.subConfigurationDefinition.configurationId
                );

                if (tableOption && tableOption.Value) {
                    const tableConfig = JSON.parse(tableOption.Value);
                    configuration.tableConfiguration = tableConfig;
                    await TableConfigurationResolver.getInstance().resolve(token, tableConfig, sysConfigOptions);
                }
            }
        }
    }

}
