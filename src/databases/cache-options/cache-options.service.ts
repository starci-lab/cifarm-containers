import { redisClusterEnabled, RedisType, envConfig, redisClusterRunInDocker } from "@src/env"
import {
    BaseCacheOptions,
    CacheOptions,
    RedisCacheType,
    RedisCacheOptions,
    RedisClusterCacheOptions
} from "../databases.types"
import { Injectable } from "@nestjs/common"
import { ExecDockerRedisClusterService } from "@src/exec"
import { NatMap } from "ioredis"

@Injectable()
export class CacheOptionsService {
    private readonly baseConfig: BaseCacheOptions
    private readonly useCluster: boolean

    constructor(private readonly execDockerRedisClusterService: ExecDockerRedisClusterService) {
        // Determine if Redis cluster is enabled
        this.useCluster = redisClusterEnabled(RedisType.Cache)

        // Base cache options setup
        this.baseConfig = {
            duration: envConfig().cacheTimeoutMs,
            alwaysEnabled: !this.useCluster, // Only disable globally for cluster
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
            options: {
                host: envConfig().databases.redis[RedisType.Cache].host,
                port: envConfig().databases.redis[RedisType.Cache].port,
                password: envConfig().databases.redis[RedisType.Cache].password || undefined
            }
        }
    }

    private async createClusterCacheOptions(): Promise<RedisClusterCacheOptions> {
        // Cluster Redis cache options
        let natMap: NatMap
        if (redisClusterRunInDocker(RedisType.Cache)) {
            natMap = await this.execDockerRedisClusterService.getNatMap()
        }
        return {
            ...this.baseConfig,
            type: RedisCacheType.IoRedisCluster,
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
                    natMap
                }
            }
        }
    }
}
