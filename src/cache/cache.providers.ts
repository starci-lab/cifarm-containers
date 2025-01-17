import { Provider } from "@nestjs/common"
import { CACHE_MANAGER } from "./cache.constants"
import { Cache, createCache } from "cache-manager"
import { envConfig } from "@src/env"
import { KeyvService } from "./keyv"

export const createRedisCacheManagerFactoryProvider = (): Provider => ({
    provide: CACHE_MANAGER,
    inject: [KeyvService],
    useFactory: (keyvService: KeyvService): Cache => {
        const keyv = keyvService.createKeyv()
        return createCache({
            stores: [keyv],
            ttl: envConfig().cacheTimeoutMs.manager
        })
    }
})

export const createMemoryCacheManagerFactoryProvider = (): Provider => ({
    provide: CACHE_MANAGER,
    useFactory: (): Cache => {
        return createCache({
            ttl: envConfig().cacheTimeoutMs.manager
        })
    }
})
