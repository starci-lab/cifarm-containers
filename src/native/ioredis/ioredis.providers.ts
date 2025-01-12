import { Provider } from "@nestjs/common"
import { Redis, Cluster } from "ioredis"
import { redisClusterEnabled, RedisType } from "@src/env"
import { IoRedisClientOrCluster } from "./ioredis.types"
import { IoRedisFactory } from "./ioredis.factory"
import { getIoRedisToken } from "./ioredis.utils"

export const createIoRedisFactoryProvider = (type: RedisType = RedisType.Cache): Provider => ({
    provide: getIoRedisToken(type),
    inject: [IoRedisFactory],
    useFactory: async (ioRedisFactory: IoRedisFactory): Promise<IoRedisClientOrCluster> => {
        const clusterEnabled = redisClusterEnabled(type)
        if (!clusterEnabled) {
            return new Redis(ioRedisFactory.getSingleOptions())
        }

        const [startupNodes, clusterOptions] = await ioRedisFactory.getClusterOptions()
        return new Cluster(startupNodes, clusterOptions)
    }
})
