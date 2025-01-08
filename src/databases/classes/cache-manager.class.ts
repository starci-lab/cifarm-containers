import { CreateCacheOptionsParams, CacheOptions, CacheType } from "@src/cache"
import { redisClusterEnabled, RedisType, envConfig } from "@src/env"
import { BaseCacheOptions, RedisCacheOptions, RedisClusterCacheOptions } from "./classes.types"

export class CacheManager {
    private baseConfig: BaseCacheOptions
    private useCluster: boolean

    constructor() {
        // Determine if Redis cluster is enabled
        this.useCluster = redisClusterEnabled(RedisType.Cache)

        // Base cache options setup
        this.baseConfig = {
            duration: envConfig().cacheTimeoutMs,
            alwaysEnabled: !this.useCluster, // Only disable globally for cluster
            ignoreErrors: true
        }
    }

    public createCacheOptions(params?: CreateCacheOptionsParams): CacheOptions {
        if (this.useCluster) {
            return this.createClusterCacheOptions(params)
        }
        return this.createSingleCacheOptions()
    }

    private createSingleCacheOptions(): RedisCacheOptions {
        // Single Redis instance cache options
        return {
            ...this.baseConfig,
            type: CacheType.IoRedis,
            options: {
                host: envConfig().databases.redis[RedisType.Cache].host,
                port: envConfig().databases.redis[RedisType.Cache].port,
                password: envConfig().databases.redis[RedisType.Cache].password || undefined
            }
        }
    }

    private createClusterCacheOptions(params?: CreateCacheOptionsParams): RedisClusterCacheOptions {
        // Cluster Redis cache options
        return {
            ...this.baseConfig,
            type: CacheType.IoRedisCluster,
            options: {
                startupNodes: [
                    {
                        host: envConfig().databases.redis[RedisType.Cache].host,
                        port: Number(envConfig().databases.redis[RedisType.Cache].port)
                    }
                ],
                options: {
                    scaleReads: "slave",
                    redisOptions: {
                        password: envConfig().databases.redis[RedisType.Cache].password || undefined
                    },
                    natMap: params?.natMap
                }
            }
        }
    }
}
