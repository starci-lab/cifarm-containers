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

    createQueueOptions() : QueueOptions {
        console.log("called")
        if (!redisClusterEnabled()) {
            const connection = new Redis({
                host: envConfig().databases.redis[RedisType.Job].host,
                port: Number(envConfig().databases.redis[RedisType.Job].port),
                password: envConfig().databases.redis[RedisType.Job].password || undefined,
            })
            return {
                connection
            }
        }
        let natMap: NatMap
        if (redisClusterRunInDocker()) {
            natMap = this.execDockerRedisClusterService.getNatMap()
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