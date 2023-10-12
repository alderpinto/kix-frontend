/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PropertyInstruction } from './PropertyInstruction';

export class RuleResult {

    public InputOrder: string[];
    public propertyInstructions: PropertyInstruction[] = [];

    public constructor(result: any) {
        if (result) {
            this.InputOrder = result.InputOrder || [];

            for (const value in result) {
                if (Object.prototype.hasOwnProperty.call(result, value) && value !== 'InputOrder') {
                    this.propertyInstructions.push(new PropertyInstruction(value, result[value]));
                }
            }
        }
    }

}