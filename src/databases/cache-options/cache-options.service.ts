import { redisClusterEnabled, RedisType, envConfig } from "@src/env"
import {
    BaseCacheOptions,
    CacheOptions,
    RedisCacheType,
    RedisCacheOptions,
    RedisClusterCacheOptions
} from "./cache-options.types"
import { Injectable } from "@nestjs/common"
import { IoRedisFactory } from "@src/native"

@Injectable()
export class CacheOptionsService {
    private readonly baseConfig: BaseCacheOptions
    private readonly useCluster: boolean

    constructor(private readonly ioRedisFactory: IoRedisFactory) {
        // Determine if Redis cluster is enabled
        this.useCluster = redisClusterEnabled(RedisType.Cache)

        // Base cache options setup
        this.baseConfig = {
            duration: envConfig().cacheTimeoutMs.postgreSql,
            alwaysEnabled: false, // Only disable globally for cluster
            ignoreErrors: true
        }
    }

    public async createCacheOptions(): Promise<CacheOptions> {
        if (this.useCluster) {
            return await this.createClusterCacheOptions()
        }
        return this.createSingleCacheOptions()
    }

    private createSingleCacheOptions(): RedisCacheOptions {
        // Single Redis instance cache options
        return {
            ...this.baseConfig,
            type: RedisCacheType.IoRedis,
            options: this.ioRedisFactory.getSingleOptions()
        }
    }

    private async createClusterCacheOptions(): Promise<RedisClusterCacheOptions> {
        // Cluster Redis cache options
        const [startupNodes, options] = await this.ioRedisFactory.getClusterOptions()
        return {
            ...this.baseConfig,
            type: RedisCacheType.IoRedisCluster,
            options: {
                startupNodes,
                options
            }
        }
    }
}
