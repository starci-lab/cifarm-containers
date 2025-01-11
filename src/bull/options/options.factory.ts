import { Injectable } from "@nestjs/common"
import { envConfig, redisClusterEnabled, redisClusterRunInDocker, RedisType } from "@src/env"
import { ExecDockerRedisClusterService } from "@src/exec"
import { QueueOptions } from "bullmq"
import Redis, { Cluster, NatMap } from "ioredis"

@Injectable()
export class QueueOptionsFactory {
    constructor(
        private readonly execDockerRedisClusterService: ExecDockerRedisClusterService
    ) {}

    public async createQueueOptions(): Promise<QueueOptions> {
        const clusterEnabled = redisClusterEnabled(RedisType.Job)
        if (!clusterEnabled) {
            const connection = new Redis({
                host: envConfig().databases.redis[RedisType.Job].host,
                port: Number(envConfig().databases.redis[RedisType.Job].port),
                password: envConfig().databases.redis[RedisType.Job].password || undefined,
                maxRetriesPerRequest: null
            })
            return {
                connection
            }
        }
        let natMap: NatMap
        if (redisClusterRunInDocker()) {
            natMap = await this.execDockerRedisClusterService.getNatMap()
        }
        const connection = new Cluster([
            {
                host: envConfig().databases.redis[RedisType.Job].host,
                port: Number(envConfig().databases.redis[RedisType.Job].port)
            }
        ], {
            scaleReads: "all",
            redisOptions: {
                password: envConfig().databases.redis[RedisType.Job].password || undefined,
                enableAutoPipelining: true
            },
            natMap
        })
        return {
            connection
        }
    }
}