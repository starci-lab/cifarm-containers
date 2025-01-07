import { createCache } from "cache-manager"
import { Module } from "@nestjs/common"
import { CacheMemoryService } from "./memory.service"
import { CacheableMemory, Keyv } from "cacheable"
import { CACHE_MEMORY_MANAGER } from "./memory.constants"
import { envConfig } from "@src/env"
@Module({})
export class CacheMemoryModule {
    public static forRoot() {
        // Create a cache manager with a memory store
        const cacheManager = createCache({
            stores: [
                new Keyv({
                    store: new CacheableMemory({ ttl: envConfig().cacheTimeoutMs, lruSize: 5000 })
                })
            ]
        })

        return {
            module: CacheMemoryModule,
            providers: [{ provide: CACHE_MEMORY_MANAGER, useValue: cacheManager }, CacheMemoryService],
            exports: [CacheMemoryService]
        }
    }
}
