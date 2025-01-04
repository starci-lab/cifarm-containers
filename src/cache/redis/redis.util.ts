import { envConfig } from "@src/env"
import { createCacheOptions } from "./redis.config"

export const getCacheOptions = (cacheEnabled: boolean) => {
    return cacheEnabled ? createCacheOptions(envConfig().databases.redis.cluster.enabled) : undefined
}
