/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFormFieldValue } from './DynamicFormFieldValue';
import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { ObjectPropertyValueOption } from '../../../../../model/ObjectPropertyValueOption';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public dynamicValues: DynamicFormFieldValue[] = [],
        public options: ObjectPropertyValueOption[] = []
    ) {
        super();
    }

}
