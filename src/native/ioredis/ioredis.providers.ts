import { Provider } from "@nestjs/common"
import { Redis, Cluster } from "ioredis"
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from "./ioredis.module-definition"
import { redisClusterEnabled, RedisType } from "@src/env"
import { IOREDIS } from "./ioredis.constants"
import { IoRedisClientOrCluster } from "./ioredis.types"
import { IoRedisFactory } from "./ioredis.factory"

export const createIoRedisFactoryProvider = (): Provider => ({
    provide: IOREDIS,
    inject: [MODULE_OPTIONS_TOKEN, IoRedisFactory],
    useFactory: async (
        options: typeof OPTIONS_TYPE,
        ioRedisFactory: IoRedisFactory
    ): Promise<IoRedisClientOrCluster> => {
        const type = options.type || RedisType.Cache

        const clusterEnabled = redisClusterEnabled(type)
        if (!clusterEnabled) {
            return new Redis(ioRedisFactory.getSingleOptions())
        }

        const [startupNodes, clusterOptions] = await ioRedisFactory.getClusterOptions()
        return new Cluster(startupNodes, clusterOptions)
    }
})
