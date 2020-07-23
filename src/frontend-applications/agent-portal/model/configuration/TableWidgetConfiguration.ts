/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from './IConfiguration';
import { ConfigurationType } from './ConfigurationType';
import { KIXObjectType } from '../kix/KIXObjectType';
import { SortOrder } from '../SortOrder';
import { ConfigurationDefinition } from './ConfigurationDefinition';
import { KIXObjectPropertyFilter } from '../KIXObjectPropertyFilter';
import { TableConfiguration } from './TableConfiguration';

export class TableWidgetConfiguration implements IConfiguration {

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType,
        public objectType: KIXObjectType | string,
        public sort?: [string, SortOrder],
        public subConfigurationDefinition?: ConfigurationDefinition,
        public tableConfiguration?: TableConfiguration,
        public headerComponents?: string[],
        public showFilter: boolean = true,
        public shortTable: boolean = false,
        public predefinedTableFilters: KIXObjectPropertyFilter[] = [],
        public cache: boolean = false,
        public resetFilterOnReload: boolean = true
    ) { }

}
