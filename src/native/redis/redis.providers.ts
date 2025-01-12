import { Provider } from "@nestjs/common"
import { envConfig, redisClusterEnabled, redisClusterRunInDocker, RedisType } from "@src/env"
import { createClient, createCluster } from "redis"
import { RedisClientOrCluster } from "./redis.types"
import { NatMap } from "ioredis"
import { getRedisToken } from "./redis.utils"
import { ExecDockerRedisClusterService } from "@src/exec"

export const createRedisFactoryProvider = (type: RedisType = RedisType.Cache): Provider => ({
    provide: getRedisToken(type),
    inject: [ExecDockerRedisClusterService],
    useFactory: async (
        execDockerRedisClusterService: ExecDockerRedisClusterService
    ): Promise<RedisClientOrCluster> => {
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