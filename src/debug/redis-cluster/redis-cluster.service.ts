import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { envConfig, RedisType } from "@src/env"
import { Cluster } from "ioredis"
import { DEBUG_REDIS_CLUSTER_OPTIONS } from "./redis-cluster.constants"
import { DebugRedisClusterOptions } from "./redis-cluster.types"
import { ChildProcessDockerRedisClusterService } from "@src/child-process"

@Injectable()
export class DebugRedisClusterService implements OnModuleInit {
    private readonly logger = new Logger(DebugRedisClusterService.name)

    private connection: Cluster
    private type: RedisType
    constructor(
        private readonly childProcessDockerRedisClusterService: ChildProcessDockerRedisClusterService,
        @Inject(DEBUG_REDIS_CLUSTER_OPTIONS)
        private readonly options?: DebugRedisClusterOptions,
    ) { 
        this.type = options?.type || RedisType.Cache
    }

    async onModuleInit() {
        //check if debugging enabled
        this.logger.debug("Debugging Redis cluster connection...")
        this.logger.debug(`Redis type: ${this.type}`)
        //check if cluster enabled
        if (!envConfig().databases.redis.cache.cluster.enabled) {
            this.logger.debug("Redis cluster is disabled. Skipp debugging")
            return
        }

        const natMap = await this.childProcessDockerRedisClusterService.getNatMap()

        //check if cluster run in Docker
        this.connection = new Cluster(
            [
                {
                    host: envConfig().databases.redis[this.type].host,
                    port: envConfig().databases.redis[this.type].port
                }
            ],
            {
                redisOptions: {
                    password: envConfig().databases.redis[RedisType.Cache].password
                },
                //nat - for local Docker development only, not for production
                natMap
            }
        )
        const pong = await this.connection.ping()
        this.logger.debug(`Redis cluster ping response: ${pong}`)
    }
}