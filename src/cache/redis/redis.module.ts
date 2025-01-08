import { createCache } from "cache-manager"
import { DynamicModule, Module, Provider } from "@nestjs/common"
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
import { ConfigurableModuleClass } from "./redis.module-definition"

@Module({})
export class CacheRedisModule extends ConfigurableModuleClass {
    static forFeature(): DynamicModule {
        return {
            module: CacheRedisModule,
            providers: [CacheRedisService],
            exports: [CacheRedisService]
        }
    }

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
                                stores: [keyvManager.createKeyv()],
                                ttl: envConfig().cacheTimeoutMs
                            })
                        },
                        inject: [ChildProcessDockerRedisClusterService]
                    }
                ]
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

        const sharedCacheRedisProviders: Array<Provider> = [{
            provide: CACHE_REDIS_MANAGER,
            useValue: cacheManager
        }]

        return {
            global: true,
            module: CacheRedisModule,
            providers: sharedCacheRedisProviders,
            exports: sharedCacheRedisProviders
        }
    }
}
