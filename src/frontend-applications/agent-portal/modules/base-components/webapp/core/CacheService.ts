/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import md5 = require('md5');
import { ClientStorageService } from './ClientStorageService';
import { ObjectUpdatedEventData } from '../../../../model/ObjectUpdatedEventData';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class BrowserCacheService {

    private static INSTANCE: BrowserCacheService;

    public static getInstance(): BrowserCacheService {
        if (!BrowserCacheService.INSTANCE) {
            BrowserCacheService.INSTANCE = new BrowserCacheService();
        }
        return BrowserCacheService.INSTANCE;
    }

    private constructor() { }

    private cache: Map<string, any> = new Map();

    private keyIndex: Map<string, string[]> = new Map();

    public has(key: string, cacheKeyPrefix?: string): boolean {
        key = md5(key);
        return this.cache.has(key);
    }

    public get(key: string, cacheKeyPrefix?: string): any {
        key = md5(key);
        return this.cache.get(key);
    }

    public set(key: string, value: any, cacheKeyPrefix?: string): void {
        key = md5(key);
        this.cache.set(key, value);
        if (cacheKeyPrefix) {
            if (!this.keyIndex.has(cacheKeyPrefix)) {
                this.keyIndex.set(cacheKeyPrefix, []);
            }
            this.keyIndex.get(cacheKeyPrefix).push(key);
        }
    }

    public delete(key: string, cacheKeyPrefix: string, useMD5: boolean = true): void {
        if (useMD5) {
            key = md5(key);
        }

        this.cache.delete(key);
        if (cacheKeyPrefix) {
            if (this.keyIndex.has(cacheKeyPrefix)) {
                const keys = this.keyIndex.get(cacheKeyPrefix);
                const index = keys.findIndex((k) => k === key);
                if (index !== -1) {
                    keys.splice(index, 1);
                }
            }
        }
    }

    public deleteKeys(cacheKeyPrefix: string): void {
        const prefixes = this.getCacheKeyPrefix(cacheKeyPrefix);
        for (const prefix of prefixes) {
            if (this.keyIndex.has(prefix)) {
                const keys = [...this.keyIndex.get(prefix)];
                console.debug(
                    `CacheService: delete cacheKeyPrefix ${prefix} - key count: ${keys.length}`
                );
                for (const key of keys) {
                    this.delete(key, prefix, false);
                }
                this.keyIndex.delete(prefix);
            }
        }
    }

    public async updateCaches(events: ObjectUpdatedEventData[]): Promise<void> {
        for (const event of events) {
            if (event.RequestID !== ClientStorageService.getClientRequestId()) {
                if (!event.Namespace.startsWith(KIXObjectType.TRANSLATION_PATTERN)) {
                    this.deleteKeys(event.Namespace);
                }
            }
        }
    }

    private getCacheKeyPrefix(objectNamespace: string): string[] {
        let cacheKeyPrefixes: string[] = [];
        if (objectNamespace && objectNamespace.indexOf('.') !== -1) {
            const namespace = objectNamespace.split('.');
            if (namespace[0] === 'CMDB') {
                cacheKeyPrefixes.push(namespace[1]);
            } else if (namespace[0] === 'FAQ') {
                cacheKeyPrefixes.push(namespace[1]);
            } else {
                cacheKeyPrefixes.push(namespace[0]);
            }
        } else if (objectNamespace === 'State') {
            cacheKeyPrefixes.push(KIXObjectType.TICKET_STATE);
        } else if (objectNamespace === 'Type') {
            cacheKeyPrefixes.push(KIXObjectType.TICKET_TYPE);
        } else {
            cacheKeyPrefixes.push(objectNamespace);
        }

        switch (cacheKeyPrefixes[0]) {
            case KIXObjectType.ARTICLE:
            case KIXObjectType.WATCHER:
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                break;
            case KIXObjectType.TICKET:
                cacheKeyPrefixes.push(KIXObjectType.ORGANISATION);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                cacheKeyPrefixes.push(KIXObjectType.QUEUE);
                cacheKeyPrefixes.push(KIXObjectType.CURRENT_USER);
                break;
            case KIXObjectType.FAQ_VOTE:
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
                break;
            case KIXObjectType.FAQ_ARTICLE:
                cacheKeyPrefixes.push(KIXObjectType.FAQ_CATEGORY);
                break;
            case KIXObjectType.FAQ_CATEGORY:
                cacheKeyPrefixes.push(KIXObjectType.OBJECT_ICON);
                break;
            case KIXObjectType.CONFIG_ITEM:
            case KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION:
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM_CLASS);
                break;
            case KIXObjectType.PERSONAL_SETTINGS:
            case KIXObjectType.USER_PREFERENCE:
                cacheKeyPrefixes.push(KIXObjectType.USER);
                cacheKeyPrefixes.push(KIXObjectType.CURRENT_USER);
                break;
            case KIXObjectType.USER:
                cacheKeyPrefixes.push(KIXObjectType.ROLE);
                break;
            case KIXObjectType.LINK:
            case KIXObjectType.LINK_OBJECT:
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM);
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
                cacheKeyPrefixes.push(KIXObjectType.LINK);
                cacheKeyPrefixes.push(KIXObjectType.LINK_OBJECT);
                break;
            case KIXObjectType.CONTACT:
                cacheKeyPrefixes.push(KIXObjectType.ORGANISATION);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                break;
            case KIXObjectType.PERMISSION:
            case KIXObjectType.ROLE:
                this.clear();
                cacheKeyPrefixes = [];
                break;
            case KIXObjectType.QUEUE:
            case KIXObjectType.TICKET_PRIORITY:
            case KIXObjectType.TICKET_STATE:
            case KIXObjectType.TICKET_TYPE:
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                cacheKeyPrefixes.push(KIXObjectType.OBJECT_ICON);
                break;
            case KIXObjectType.CONFIG_ITEM_CLASS:
                cacheKeyPrefixes.push(KIXObjectType.OBJECT_ICON);
                break;
            case KIXObjectType.TRANSLATION_PATTERN:
            case KIXObjectType.TRANSLATION:
            case KIXObjectType.TRANSLATION_LANGUAGE:
                cacheKeyPrefixes.push(KIXObjectType.TRANSLATION_PATTERN);
                cacheKeyPrefixes.push(KIXObjectType.TRANSLATION);
                cacheKeyPrefixes.push(KIXObjectType.TRANSLATION_LANGUAGE);
                break;
            case KIXObjectType.CONFIG_ITEM_VERSION:
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM);
                break;
            case KIXObjectType.GENERAL_CATALOG_ITEM:
                cacheKeyPrefixes.push(KIXObjectType.OBJECT_ICON);
                cacheKeyPrefixes.push(KIXObjectType.GENERAL_CATALOG_CLASS);
                break;
            case KIXObjectType.SYS_CONFIG_OPTION_DEFINITION:
            case KIXObjectType.SYS_CONFIG_OPTION:
                cacheKeyPrefixes.push(KIXObjectType.SYS_CONFIG_OPTION);
                cacheKeyPrefixes.push(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION);
                break;
            case KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN:
                cacheKeyPrefixes.push(KIXObjectType.IMPORT_EXPORT_TEMPLATE);
                break;
            default:
        }

        return cacheKeyPrefixes;
    }

    private clear(): void {
        const iterator = this.keyIndex.keys();

        let prefix = iterator.next();
        while (prefix && prefix.value) {
            const keys = this.keyIndex.get(prefix.value);
            console.debug(
                `CacheService: delete cacheKeyPrefix ${prefix.value} - key count: ${keys.length}`
            );
            keys.forEach((k) => this.cache.delete(k));
            prefix = iterator.next();
        }

        this.keyIndex = new Map();
    }

}
