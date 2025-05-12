import { Provider } from "@nestjs/common"
import { Redis, Cluster } from "ioredis"
import { redisClusterEnabled, RedisType } from "@src/env"
import { IoRedisClientOrCluster, IoRedisOptions } from "./ioredis.types"
import { IoRedisFactory } from "./ioredis.factory"
import { getIoRedisToken } from "./ioredis.utils"
import { MODULE_OPTIONS_TOKEN } from "./ioredis.module-definition"

export const createIoRedisFactoryProvider = (
    type: RedisType = RedisType.Cache
): Provider => ({
    provide: getIoRedisToken(type),
    inject: [IoRedisFactory, MODULE_OPTIONS_TOKEN],
    useFactory: async (
        ioRedisFactory: IoRedisFactory,
        options: IoRedisOptions
    ): Promise<IoRedisClientOrCluster> => {
        const clusterEnabled = redisClusterEnabled(type)
        if (!clusterEnabled) {
            return new Redis(ioRedisFactory.getSingleOptions(options.additionalOptions))
        }

        const [startupNodes, clusterOptions] = await ioRedisFactory.getClusterOptions()
        return new Cluster(startupNodes, clusterOptions)
    }
})
