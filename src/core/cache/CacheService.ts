import { ConfigurationService, LoggingService } from "../services";
import { Memcached } from "./Memcached";
import { InMemoryCache } from "./InMemoryCache";
import { ObjectUpdatedEventData, KIXObjectType } from "../model";
import md5 = require('md5');

export class CacheService {

    private static INSTANCE: CacheService;

    public static getInstance(): CacheService {
        if (!CacheService.INSTANCE) {
            CacheService.INSTANCE = new CacheService();
        }
        return CacheService.INSTANCE;
    }

    private useMemcached: boolean = false;
    private useInMemoryCache: boolean = false;

    private constructor() { }

    public init(): void {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        if (serverConfig.USE_MEMCACHED && serverConfig.MEMCACHED) {
            this.useMemcached = true;
            Memcached.getInstance();
        }

        if (serverConfig.USE_IN_MEMORY_CACHE) {
            this.useInMemoryCache = true;
        }
    }

    public async has(key: string, cacheKeyPrefix?: string): Promise<boolean> {
        key = md5(key);
        if (process.env.NODE_ENV === 'test') {
            return false;
        } else if (this.useMemcached) {
            return await Memcached.getInstance().has(key);
        } else if (this.useInMemoryCache) {
            return await InMemoryCache.getInstance().has(key);
        }

        return false;
    }

    public async get(key: string, cacheKeyPrefix?: string): Promise<any> {
        key = md5(key);
        if (this.useMemcached) {
            return await Memcached.getInstance().get(key);
        } else if (this.useInMemoryCache) {
            return await InMemoryCache.getInstance().get(key);
        }
        return null;
    }

    public async set(key: string, value: any, cacheKeyPrefix?: string): Promise<void> {
        key = md5(key);
        if (this.useMemcached) {
            await Memcached.getInstance().set(key, cacheKeyPrefix, value);
        } else if (this.useInMemoryCache) {
            await InMemoryCache.getInstance().set(key, cacheKeyPrefix, value);
        }
    }

    public async updateCaches(events: ObjectUpdatedEventData[]): Promise<void> {
        for (const event of events) {
            LoggingService.getInstance().debug('Backend Notification: ' + JSON.stringify(event));
            if (!event.Namespace.startsWith(KIXObjectType.TRANSLATION)) {
                await this.deleteKeys(event.Namespace);
            }
        }
    }

    public async deleteKeys(cacheKeyPrefix: string): Promise<void> {
        const prefixes = await this.getCacheKeyPrefixes(cacheKeyPrefix);
        for (const prefix of prefixes) {
            if (this.useMemcached) {
                await Memcached.getInstance().deleteKeys(prefix);
            } else if (this.useInMemoryCache) {
                await InMemoryCache.getInstance().deleteKeys(prefix);
            }
        }
    }

    private async getCacheKeyPrefixes(objectNamespace: string): Promise<string[]> {
        let cacheKeyPrefixes: string[] = [];
        if (objectNamespace && objectNamespace.indexOf('.') !== -1) {
            const namespace = objectNamespace.split('.');
            if (namespace[0] === 'CMDB') {
                cacheKeyPrefixes.push(namespace[1]);
            } else if (namespace[0] === 'FAQ') {
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
            } else {
                cacheKeyPrefixes.push(namespace[0]);
            }
        } else {
            cacheKeyPrefixes.push(objectNamespace);
        }

        switch (cacheKeyPrefixes[0]) {
            case KIXObjectType.WATCHER:
            case KIXObjectType.ARTICLE:
                cacheKeyPrefixes.push(KIXObjectType.TICKET);
                break;
            case KIXObjectType.TICKET:
                cacheKeyPrefixes.push(KIXObjectType.CUSTOMER);
                cacheKeyPrefixes.push(KIXObjectType.CONTACT);
                break;
            case KIXObjectType.FAQ_VOTE:
                cacheKeyPrefixes.push(KIXObjectType.FAQ_ARTICLE);
                break;
            case KIXObjectType.FAQ_ARTICLE:
                cacheKeyPrefixes.push(KIXObjectType.FAQ_CATEGORY);
                break;
            case KIXObjectType.CONFIG_ITEM_CLASS:
            case KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION:
                cacheKeyPrefixes.push(KIXObjectType.CONFIG_ITEM_CLASS);
                break;
            case KIXObjectType.USER_PREFERENCE:
                cacheKeyPrefixes.push(KIXObjectType.USER);
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
            case KIXObjectType.PERMISSION:
            case KIXObjectType.ROLE:
                await this.clearCache();
                cacheKeyPrefixes = [];
                break;
            default:
        }

        return cacheKeyPrefixes;
    }

    private async clearCache(): Promise<void> {
        if (this.useMemcached) {
            await Memcached.getInstance().clear([KIXObjectType.TRANSLATION]);
        } else if (this.useInMemoryCache) {
            await InMemoryCache.getInstance().clear([KIXObjectType.TRANSLATION]);
        }
    }

}
