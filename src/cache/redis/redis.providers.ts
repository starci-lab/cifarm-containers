import { Provider } from "@nestjs/common"
import { CACHE_REDIS_MANAGER } from "./redis.types"
import { Cache, createCache } from "cache-manager"
import { KEYV_MANAGER } from "./redis.constants"
import { RedisKeyvManager } from "./keyv-manager.class"
import { envConfig } from "@src/env"
import { NatMap } from "ioredis"
import { sleep } from "@aptos-labs/ts-sdk"

export const keyVManagerProvider: Provider = {
    provide: KEYV_MANAGER,
    useClass: RedisKeyvManager
}
export const createCacheManagerFactoryProvider: Provider = {
    provide: CACHE_REDIS_MANAGER,
    inject: [KEYV_MANAGER],
    useFactory: async (keyvManager: RedisKeyvManager): Promise<Cache> => {
        // create the cache manager
        let natMap: NatMap
        await sleep(1000)
        return createCache({
            stores: [keyvManager.createKeyv()],
            ttl: envConfig().cacheTimeoutMs
        })
    }
}