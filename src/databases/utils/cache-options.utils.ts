import { envConfig, isRedisClusterEnabled, RedisClusterType } from "@src/env"

export const SLOTS_REFRESH_TIMEOUT = 3000
export const MAX_RETRIES_PER_REQUEST = 3
export const SHOW_FRIENDLY_ERROR_STACK = true
export const CACHE_DURATION = 1 * 24 * 60 * 60 * 1000

// Enum to define different cache types
export enum CacheType {
    DATABASE = "database",
    REDIS = "redis",
    IOREDIS = "ioredis",
    IOREDIS_CLUSTER = "ioredis/cluster"
}

interface BaseCacheOptions {
    duration: number;           // Cache expiration duration in milliseconds
    alwaysEnabled: boolean;     // Enables caching globally for all queries
    ignoreErrors: boolean;      // Ignore cache errors and fallback to database
}

interface RedisCacheOptions extends BaseCacheOptions {
    type: CacheType.REDIS | CacheType.IOREDIS;
    options: {
        socket: {
            host: string;
            port: number;
        };
    };
}

interface RedisClusterCacheOptions extends BaseCacheOptions {
    type: CacheType.IOREDIS_CLUSTER;
    options: {
        startupNodes: Array<{ host: string; port: number }>;
        scaleReads: "slave" | "master" | "all";
        slotsRefreshTimeout: number;
        redisOptions: {
            maxRetriesPerRequest: number;
            showFriendlyErrorStack: boolean;
        };
    };
}

export type CacheOptions = RedisCacheOptions | RedisClusterCacheOptions;

export const createCacheOptions = (): CacheOptions => {
    // Check if Redis cluster is enabled for cache
    const useCluster = isRedisClusterEnabled(RedisClusterType.Cache)

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
                        host: envConfig().databases.redis.cache.host,
                        port: Number(envConfig().databases.redis.cache.port)
                    }
                ],
                scaleReads: "slave",
                slotsRefreshTimeout: SLOTS_REFRESH_TIMEOUT,
                redisOptions: {
                    maxRetriesPerRequest: MAX_RETRIES_PER_REQUEST,
                    showFriendlyErrorStack: SHOW_FRIENDLY_ERROR_STACK
                }
            }
        }
    }

    return {
        ...baseConfig,
        type: CacheType.REDIS,
        options: {
            socket: {
                host: envConfig().databases.redis.cache.host,
                port: Number(envConfig().databases.redis.cache.port)
            }
        }
    }
}
