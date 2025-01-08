import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common"
import { Cache } from "cache-manager"
import { CACHE_MANAGER } from "./cache.constants"
@Injectable()
export class CacheService implements OnModuleDestroy {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) { }

    public getCacheManager(): Cache {
        return this.cacheManager
    }

    async onModuleDestroy() {
        await this.cacheManager.disconnect()
    }
}