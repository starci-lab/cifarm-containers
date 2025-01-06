import { envConfig, redisClusterEnabled, RedisType } from "@src/env"
import { ClusterNode, ClusterOptions, NatMap, RedisOptions } from "ioredis"

export const SLOTS_REFRESH_TIMEOUT = 3000
export const MAX_RETRIES_PER_REQUEST = 3
export const SHOW_FRIENDLY_ERROR_STACK = true
export const CACHE_DURATION = 1 * 24 * 60 * 60 * 1000

// Enum to define different cache types
export enum CacheType {
    IOREDIS = "ioredis",
    IOREDIS_CLUSTER = "ioredis/cluster"
}

interface BaseCacheOptions {
    duration: number;           // Cache expiration duration in milliseconds
    alwaysEnabled: boolean;     // Enables caching globally for all queries
    ignoreErrors: boolean;      // Ignore cache errors and fallback to database
}

interface RedisCacheOptions extends BaseCacheOptions {
    type: CacheType.IOREDIS;
    options: RedisOptions
}

interface RedisClusterCacheOptions extends BaseCacheOptions {
    type: CacheType.IOREDIS_CLUSTER;
    options: {
        startupNodes: Array<ClusterNode>;
        options?: ClusterOptions
    };
}

export type CacheOptions = RedisCacheOptions | RedisClusterCacheOptions;

export interface CreateCacheOptionsParams {
    natMap?: NatMap
}

export const createCacheOptions = (params?: CreateCacheOptionsParams): CacheOptions => {
    // Check if Redis cluster is enabled for cache
    const useCluster = redisClusterEnabled(RedisType.Cache)

    // Base cache options
    const baseConfig: BaseCacheOptions = {
        duration: CACHE_DURATION,
        alwaysEnabled: !useCluster,  // Only disable globally for cluster
        ignoreErrors: true,
    }

    if (useCluster) {
        return {
            ...baseConfig,
            type: CacheType.IOREDIS_CLUSTER,
            options: {
                startupNodes: [
                    {
                        host: envConfig().databases.redis[RedisType.Cache].host,
                        port: Number(envConfig().databases.redis[RedisType.Cache].port)
                    }
                ],
                options: {
                    scaleReads: "slave",
                    slotsRefreshTimeout: SLOTS_REFRESH_TIMEOUT,
                    redisOptions: {
                        maxRetriesPerRequest: MAX_RETRIES_PER_REQUEST,
                        showFriendlyErrorStack: SHOW_FRIENDLY_ERROR_STACK,
                        password: envConfig().databases.redis[RedisType.Cache].password || undefined,
                    },
                    showFriendlyErrorStack: SHOW_FRIENDLY_ERROR_STACK,
                    natMap: params?.natMap
                } 
            }
        }
    }

    return {
        ...baseConfig,
        type: CacheType.IOREDIS,
        options: {
            host: envConfig().databases.redis[RedisType.Cache].host,
            port: envConfig().databases.redis[RedisType.Cache].port,
            password: envConfig().databases.redis[RedisType.Cache].password || undefined
        }
    }
}
