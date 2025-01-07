import { envConfig, redisClusterEnabled, RedisType } from "@src/env"
import { ClusterNode, ClusterOptions, NatMap, RedisOptions } from "ioredis"

// Enum to define different cache types
export enum CacheType {
    IoRedis = "ioredis",
    IoRedisCluster = "ioredis/cluster"
}

interface BaseCacheOptions {
    duration: number;           // Cache expiration duration in milliseconds
    alwaysEnabled: boolean;     // Enables caching globally for all queries
    ignoreErrors: boolean;      // Ignore cache errors and fallback to database
}

interface RedisCacheOptions extends BaseCacheOptions {
    type: CacheType.IoRedis;
    options: RedisOptions
}

interface RedisClusterCacheOptions extends BaseCacheOptions {
    type: CacheType.IoRedisCluster;
    options: {
        startupNodes: Array<ClusterNode>;
        options?: ClusterOptions
    };
}

export type CacheOptions = RedisCacheOptions | RedisClusterCacheOptions;

export interface CreateCacheOptionsParams {
    natMap?: NatMap
}

export class DbCacheManager {
    private baseConfig: BaseCacheOptions
    private useCluster: boolean
    
    constructor() {
        // Determine if Redis cluster is enabled
        this.useCluster = redisClusterEnabled(RedisType.Cache)
        
        // Base cache options setup
        this.baseConfig = {
            duration: envConfig().cacheTimeoutMs,
            alwaysEnabled: !this.useCluster,  // Only disable globally for cluster
            ignoreErrors: true,
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
                        password: envConfig().databases.redis[RedisType.Cache].password || undefined,
                    },
                    natMap: params?.natMap
                }
            }
        }
    }
}
