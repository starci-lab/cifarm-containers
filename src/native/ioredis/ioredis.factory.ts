import { Inject, Injectable } from "@nestjs/common"
import { MODULE_OPTIONS_TOKEN } from "./ioredis.module-definition"
import { IoRedisOptions } from "./ioredis.types"
import { envConfig, redisClusterRunInDocker, RedisType } from "@src/env"
import { ClusterOptions, NatMap, RedisOptions, ClusterNode } from "ioredis"
import { ExecDockerRedisClusterService } from "@src/exec"

@Injectable()
export class IoRedisFactory {
    private readonly redisType: RedisType
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: IoRedisOptions,
        private readonly execDockerRedisClusterService: ExecDockerRedisClusterService
    ) {
        this.redisType = options.type || RedisType.Cache
    }

    public getSingleOptions(additionalOptions?: RedisOptions): RedisOptions {
        return {
            host: envConfig().databases.redis[this.redisType].host,
            port: envConfig().databases.redis[this.redisType].port,
            password: envConfig().databases.redis[this.redisType].password || undefined,
            ...additionalOptions
        }
    }

    public async getClusterOptions(): Promise<[Array<ClusterNode>, ClusterOptions]> {
        let nodeAddressMap: NatMap
        if (redisClusterRunInDocker(this.redisType)) {
            nodeAddressMap = await this.execDockerRedisClusterService.getNatMap()
        }
        return [
            [
                {
                    host: envConfig().databases.redis[this.redisType].host,
                    port: Number(envConfig().databases.redis[this.redisType].port)
                }
            ],
            {
                scaleReads: "slave",
                redisOptions: {
                    password: envConfig().databases.redis[this.redisType].password || undefined,
                    enableAutoPipelining: true
                },
                natMap: nodeAddressMap
            }
        ]
    }
}
