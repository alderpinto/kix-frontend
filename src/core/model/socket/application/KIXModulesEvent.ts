/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum KIXModulesEvent {

    LOAD_MODULES = 'LOAD_MODULES',
    LOAD_MODULES_FINISHED = 'LOAD_MODULES_FINISHED',

    LOAD_RELEASE_INFO = 'LOAD_RELEASE_INFO',
    LOAD_RELEASE_INFO_FINISHED = 'LOAD_RELEASE_INFO_FINISHED',

    LOAD_OBJECT_DEFINITIONS = 'LOAD_OBJECT_DEFINITIONS',
    LOAD_OBJECT_DEFINITIONS_FINISHED = 'LOAD_OBJECT_DEFINITIONS_FINISHED',

    LOAD_FORM_CONFIGURATIONS = 'LOAD_FORM_CONFIGURATIONS',
    LOAD_FORM_CONFIGURATIONS_FINISHED = 'LOAD_FORM_CONFIGURATIONS_FINISHED',

}
