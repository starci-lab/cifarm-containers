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
    useFactory: (options: typeof OPTIONS_TYPE, keyvService: KeyvService): Cache => {
        const cacheType = options.cacheType ?? CacheType.Redis
        return createCache({
            stores: cacheType ? [keyvService.createKeyv()] : undefined,
            ttl: envConfig().cacheTimeoutMs
        })
    }
})
