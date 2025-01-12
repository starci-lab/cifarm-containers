import { Provider } from "@nestjs/common"
import { MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from "./redis.module-definition"
import { envConfig, redisClusterEnabled, redisClusterRunInDocker, RedisType } from "@src/env"
import { REDIS } from "./redis.constants"
import { ExecDockerRedisClusterService } from "@src/exec"
import { createClient, createCluster } from "redis"
import { RedisClientOrCluster } from "./redis.types"
import { NatMap } from "ioredis"

export const createRedisFactoryProvider = (): Provider => ({
    provide: REDIS,
    inject: [MODULE_OPTIONS_TOKEN, ExecDockerRedisClusterService],
    useFactory: async (
        options: typeof OPTIONS_TYPE,
        execDockerRedisClusterService: ExecDockerRedisClusterService
    ): Promise<RedisClientOrCluster> => {
        const type = options.type || RedisType.Cache
        
        const clusterEnabled = redisClusterEnabled(type)

        const url = `redis://${envConfig().databases.redis[type].host}:${envConfig().databases.redis[type].port}`
        const password = envConfig().databases.redis[type].password || undefined

        //case clusterEnabled is true
        if (!clusterEnabled) {
            return createClient({
                url,
                password
            })
        } 

        let nodeAddressMap: NatMap
        if (redisClusterRunInDocker(type)) {
            nodeAddressMap = await execDockerRedisClusterService.getNatMap()
        }
        return createCluster({
            rootNodes: [
                {
                    url
                }
            ],
            defaults: {
                password
            },
            nodeAddressMap
        })
    }
}
)