/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum FormEvent {

    VALUES_CHANGED = 'VALUES_CHANGED',

    FIELD_CHILDREN_ADDED = 'FIELD_CHILDREN_ADDED',

    FIELD_EMPTY_STATE_CHANGED = 'FIELD_EMPTY_STATE_CHANGED',

    FIELD_REMOVED = 'FIELD_REMOVED',

    FIELD_DUPLICATED = 'FIELD_DUPLICATED',

    FORM_PAGE_ADDED = 'FORM_PAGE_ADDED',

    FORM_PAGES_REMOVED = 'FORM_PAGES_REMOVED',

    FORM_VALIDATED = 'FORM_VALIDATED',

    FORM_PAGE_VALIDATED = 'FORM_PAGE_VALIDATED',

    FORM_FIELD_ORDER_CHANGED = 'FORM_FIELD_ORDER_CHANGED',

    RELOAD_INPUT_VALUES = 'RELOAD_INPUT_VALUES',

    FORM_INITIALIZED = 'FORM_INITIALIZED',

    FIXED_VALUE_CHANGED = 'FIXED_VALUE_CHANGED'

}
