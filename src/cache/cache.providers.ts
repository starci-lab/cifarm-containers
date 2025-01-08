import { Provider } from "@nestjs/common"
import { CACHE_MANAGER } from "./cache.constants"
import { Cache, createCache } from "cache-manager"
import { envConfig } from "@src/env"
import { KeyvManagerService } from "./keyv-manager.service"
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from "./cache.module-definition"
import { CacheType } from "./cache.types"

export const createCacheManagerFactoryProvider = (): Provider => ({
    provide: CACHE_MANAGER,
    inject: [MODULE_OPTIONS_TOKEN, KeyvManagerService],
    useFactory: (options: typeof OPTIONS_TYPE, keyvManagerService: KeyvManagerService): Cache => {
        const cacheType = options.cacheType ?? CacheType.Redis
        return createCache({
            stores: cacheType ? [keyvManagerService.createKeyv()] : undefined,
            ttl: envConfig().cacheTimeoutMs
        })
    }
})
