import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { envConfig, runInKubernetes } from "@src/env"
import { Cluster, NatMap } from "ioredis"

@Injectable()
export class RedisClusterDebugService implements OnModuleInit {
    private readonly logger = new Logger(RedisClusterDebugService.name)

    private connection: Cluster
    async onModuleInit() {
        this.logger.debug("Debugging Redis cluster connection...")
        //check if cluster enabled
        if (!envConfig().databases.redis.cache.clusterEnabled) {
            this.logger.warn("Redis cluster is not enabled")
            return
        }
        this.logger.debug("Redis cluster is enabled")
        this.connection = new Cluster(
            [
                {
                    host: envConfig().databases.redis.cache.host,
                    port: envConfig().databases.redis.cache.port
                }
            ],
            {
                redisOptions: {
                    password: envConfig().databases.redis.cache.password
                },
                //nat - for local Docker development only, not for production
                natMap: dockerNatMap()
            }
        )
        const pong = await this.connection.ping()
        this.logger.debug(`Redis cluster ping response: ${pong}`)
    }
}

export const dockerNatMap = () : NatMap | undefined =>
    !runInKubernetes()
        ? {
            "172.25.0.7:6379": { host: "127.0.0.1", port: 6382 },
            "172.25.0.3:6379": { host: "127.0.0.1", port: 6381 },
            "172.25.0.2:6379": { host: "127.0.0.1", port: 6379 },
            "172.25.0.4:6379": { host: "127.0.0.1", port: 6384 },
            "172.25.0.6:6379": { host: "127.0.0.1", port: 6380 },
            "172.25.0.5:6379": { host: "127.0.0.1", port: 6383 }
        }
        : undefined
