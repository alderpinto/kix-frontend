/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LogLevel } from './LogLevel';

export interface IServerConfiguration {

    HTTP_PORT: number;

    HTTPS_PORT: number;

    USE_SSL: boolean;

    FRONTEND_URL: string;

    FRONTEND_TOKEN_SECRET: string;

    CHECK_TOKEN_ORIGIN: boolean;

    NOTIFICATION_URL: string;

    NOTIFICATION_INTERVAL: number;

    NOTIFICATION_CLIENT_ID: string;

    BACKEND_API_URL: string;

    LOG_LEVEL: LogLevel;

    LOG_FILEDIR: string;

    LOG_TRACE: boolean;

    ENABLE_PROFILING: boolean;

    BACKEND_API_TOKEN: string;

    UPDATE_TRANSLATIONS: boolean;

    USE_IN_MEMORY_CACHE: boolean;

    USE_REDIS_CACHE: boolean;

    REDIS_CACHE_PORT: number;

    REDIS_CACHE_HOST: string;

    INSTALLED_BUILD: number;

    LOG_REQUEST_QUEUES_INTERVAL: number;

}
