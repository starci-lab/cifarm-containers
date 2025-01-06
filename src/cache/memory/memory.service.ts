import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common"
import { Cache } from "cache-manager"
import { CACHE_MEMORY_MANAGER } from "./memory.constants"
@Injectable()
export class CacheMemoryService implements OnModuleDestroy {
    constructor(
        @Inject(CACHE_MEMORY_MANAGER)
        private readonly cacheManager: Cache
    ) { }

    public getCacheManager(): Cache {
        return this.cacheManager
    }

    async onModuleDestroy() {
        await this.cacheManager.disconnect()
    }
}