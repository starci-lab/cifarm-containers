import { Provider } from "@nestjs/common"
import { CACHE_MANAGER } from "./cache.constants"
import { Cache, createCache } from "cache-manager"
import { envConfig } from "@src/env"
import { KeyvService } from "./keyv"
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from "./cache.module-definition"
import { CacheType } from "./cache.types"

export const createCacheManagerFactoryProvider = (): Provider => ({
    provide: CACHE_MANAGER,
    inject: [MODULE_OPTIONS_TOKEN, KeyvService],
    useFactory: async (options: typeof OPTIONS_TYPE, keyvService: KeyvService): Promise<Cache> => {
        const cacheType = options.cacheType ?? CacheType.Redis
        const keyv = await keyvService.createKeyv()
        return createCache({
            stores: cacheType ? [keyv] : undefined,
            ttl: envConfig().cacheTimeoutMs.manager
        })
    }
})
