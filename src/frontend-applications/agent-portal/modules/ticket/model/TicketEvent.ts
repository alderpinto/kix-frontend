/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export enum TicketEvent {

    SET_ARTICLE_SEEN_FLAG = 'SET_ARTICLE_SEEN_FLAG',
    SET_ARTICLE_SEEN_FLAG_DONE = 'SET_ARTICLE_SEEN_FLAG_DONE',

    LOAD_ARTICLE_ATTACHMENT = 'LOAD_ARTICLE_ATTACHMENT',
    ARTICLE_ATTACHMENT_LOADED = 'ARTICLE_ATTACHMENT_LOADED',

    LOAD_ARTICLE_ZIP_ATTACHMENT = 'LOAD_ARTICLE_ZIP_ATTACHMENT',
    ARTICLE_ZIP_ATTACHMENT_LOADED = 'ARTICLE_ZIP_ATTACHMENT_LOADED'

}
