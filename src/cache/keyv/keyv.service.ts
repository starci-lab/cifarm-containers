import KeyvRedis, { createClient, createCluster, Keyv } from "@keyv/redis"
import { envConfig, redisClusterEnabled, redisClusterRunInDocker, RedisType } from "@src/env"
import { KeyvAdapter } from "@apollo/utils.keyvadapter"
import { Injectable } from "@nestjs/common"
import { ExecDockerRedisClusterService } from "@src/exec"
import { NatMap } from "ioredis"

@Injectable()
export class KeyvService {
    constructor(private readonly execDockerRedisClusterService: ExecDockerRedisClusterService) {}

    // Method to create a KeyvRedis instance
    private async createKeyvRedis(): Promise<KeyvRedis<string>> {
        const url = `redis://${envConfig().databases.redis[RedisType.Cache].host}:${envConfig().databases.redis[RedisType.Cache].port}`
        const password = envConfig().databases.redis[RedisType.Cache].password || undefined

        const clusterEnabled = redisClusterEnabled(RedisType.Cache)
        if (!clusterEnabled) {
            return new KeyvRedis(
                createClient({
                    url,
                    password
                })
            )
        }
        let nodeAddressMap: NatMap
        // If cluster run in docker, get the node address map
        if (redisClusterRunInDocker(RedisType.Cache)) {
            nodeAddressMap = await this.execDockerRedisClusterService.getNatMap()
        }
        // If cluster is not enabled, create a KeyvRedis instance with a single client
        if (!clusterEnabled) {
            return new KeyvRedis(
                createClient({
                    url,
                    password
                })
            )
        }
        return new KeyvRedis(
            createCluster({
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
        )
    }

    // Method to create a Keyv instance (wrapping around KeyvRedis)
    public async createKeyv(): Promise<Keyv<string>> {
        return new Keyv(await this.createKeyvRedis())
    }

    // Method to create KeyvAdater
    public async createKeyvAdapter(): Promise<KeyvAdapter<string>> {
        return new KeyvAdapter(await this.createKeyv())
    }
}
