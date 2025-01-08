import { RedisOptions, ClusterNode, ClusterOptions, NatMap } from "ioredis"

// Enum to define different cache types
export enum CacheType {
    IoRedis = "ioredis",
    IoRedisCluster = "ioredis/cluster"
}

export interface BaseCacheOptions {
    duration: number // Cache expiration duration in milliseconds
    alwaysEnabled: boolean // Enables caching globally for all queries
    ignoreErrors: boolean // Ignore cache errors and fallback to database
}

export interface RedisCacheOptions extends BaseCacheOptions {
    type: CacheType.IoRedis
    options: RedisOptions
}

export interface RedisClusterCacheOptions extends BaseCacheOptions {
    type: CacheType.IoRedisCluster
    options: {
        startupNodes: Array<ClusterNode>
        options?: ClusterOptions
    }
}

export type CacheOptions = RedisCacheOptions | RedisClusterCacheOptions

export interface CreateCacheOptionsParams {
    natMap?: NatMap
}
