import { createCache } from "cache-manager"
import { Module } from "@nestjs/common"
import { CacheRedisService } from "./cache-redis.service"
import { CacheKeyv } from "./cache-adapter.class"
import { CACHE_REDIS_MANAGER } from "./cache-redis.types"

@Module({})
export class CacheRedisModule {
    public static forRoot() {
        const cache = createCache({
            stores: [new CacheKeyv()]
        })
        return {
            module: CacheRedisModule,
            providers: [CacheRedisService, { provide: CACHE_REDIS_MANAGER, useValue: cache }],
            exports: [CacheRedisService]
        }
    }
}
