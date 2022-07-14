/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../../model/configuration/FormFieldOption';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { ObjectReferenceOptions } from '../../../../../base-components/webapp/core/ObjectReferenceOptions';
import { JobTypes } from '../../../../../job/model/JobTypes';
import { MacroAction } from '../../../../../job/model/MacroAction';
import { MacroActionTypeOption } from '../../../../../job/model/MacroActionTypeOption';
import { ExtendedJobFormManager } from '../../../../../job/webapp/core/ExtendedJobFormManager';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { QueueProperty } from '../../../../model/QueueProperty';

export class TeamSet extends ExtendedJobFormManager {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): Promise<FormFieldConfiguration> {
        if (
            jobType === JobTypes.TICKET
            && (actionType === 'TeamSet' || actionType === 'Team')
        ) {
            let defaultValue;
            if (action && action.Parameters) {
                defaultValue = action.Parameters[option.Name];
            }
            const field = this.getOptionField(
                option, actionType, actionFieldInstanceId, 'object-reference-input',
                defaultValue
            );
            this.setReferencedObjectOptions(field, KIXObjectType.QUEUE, false, true, false);
            field.options.push(new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true));
            field.options.push(new FormFieldOption(ObjectReferenceOptions.TEXT_AS_ID, true));
            field.options.push(
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                FilterDataType.STRING, FilterType.AND, null
                            )
                        ],
                        null, null,
                        [QueueProperty.SUB_QUEUES],
                        [QueueProperty.SUB_QUEUES]
                    )
                )
            );
            return field;
        }
        return;
    }

    private setReferencedObjectOptions(
        field: FormFieldConfiguration, objectType: KIXObjectType, multiselect: boolean, freeText: boolean,
        autocomplete: boolean
    ): void {
        field.options.push(new FormFieldOption(ObjectReferenceOptions.OBJECT, objectType));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.MULTISELECT, multiselect));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, autocomplete));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.FREETEXT, freeText));
    }
}