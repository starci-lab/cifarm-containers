import { createCache } from "cache-manager"
import { DynamicModule, Module } from "@nestjs/common"
import { CACHE_REDIS_MANAGER } from "./redis.types"
import { Keyv } from "keyv"
import { envConfig, redisClusterEnabled, redisClusterRunInDocker, RedisType } from "@src/env"
import KeyvRedis from "@keyv/redis"
import {
    ChildProcessDockerRedisClusterModule,
    ChildProcessDockerRedisClusterService
} from "@src/child-process"
import { CacheRedisService } from "./redis.service"
import { NodeAddressMap } from "@redis/client/dist/lib/cluster/cluster-slots"
import { RedisKeyvManager } from "./keyv-manager.class"

@Module({})
export class CacheRedisModule {
    static forRoot(): DynamicModule {
        const clusterEnabled = redisClusterEnabled(RedisType.Cache)
        if (clusterEnabled) {
            return {
                module: CacheRedisModule,
                imports: [
                    ChildProcessDockerRedisClusterModule.forRoot({
                        type: RedisType.Cache
                    })
                ],
                providers: [
                    {
                        provide: CACHE_REDIS_MANAGER,
                        useFactory: async (
                            childProcessDockerRedisClusterService: ChildProcessDockerRedisClusterService
                        ) => {
                            let nodeAddressMap: NodeAddressMap

                            // if running in docker, get the node address map
                            if (redisClusterRunInDocker(RedisType.Cache)) {
                                nodeAddressMap =
                                await childProcessDockerRedisClusterService.getNodeAddressMap()
                            }
                            
                            const keyvManager = new RedisKeyvManager(nodeAddressMap)
                            // create the cache manager
                            return createCache({
                                stores: [keyvManager.createKeyv()]
                            })
                        },
                        inject: [ChildProcessDockerRedisClusterService]
                    },
                    CacheRedisService
                ],
                exports: [CacheRedisService]
            }
        }

        const cacheManager = createCache({
            stores: [
                new Keyv(
                    new KeyvRedis({
                        url: `redis://${envConfig().databases.redis[RedisType.Cache].host}:${envConfig().databases.redis[RedisType.Cache].port}`,
                        password: envConfig().databases.redis[RedisType.Cache].password || undefined
                    })
                )
            ]
        })

        return {
            module: CacheRedisModule,
            providers: [
                {
                    provide: CACHE_REDIS_MANAGER,
                    useValue: cacheManager
                },
                CacheRedisService
            ],
            exports: [CacheRedisService]
        }
    }
}
