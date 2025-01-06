import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common"
import { Cache } from "cache-manager"
import { CACHE_REDIS_MANAGER } from "./cache-redis.types"
@Injectable()
export class CacheRedisService implements OnModuleDestroy {
    constructor(
        @Inject(CACHE_REDIS_MANAGER)
        private readonly cacheManager: Cache
    ) { }

    public getCacheManager(): Cache {
        return this.cacheManager
    }

    async onModuleDestroy() {
        await this.cacheManager.disconnect()
    }
}