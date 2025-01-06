import KeyvRedis, { createCluster, Keyv } from "@keyv/redis"
import { NodeAddressMap } from "@redis/client/dist/lib/cluster/cluster-slots"
import { envConfig, RedisType } from "@src/env"
import { KeyvAdapter } from "@apollo/utils.keyvadapter"

export class RedisKeyvManager {
    private readonly nodeAddressMap: NodeAddressMap

    constructor(nodeAddressMap?: NodeAddressMap) {
    // You can initialize the nodeAddressMap here or pass it as an argument
        this.nodeAddressMap = nodeAddressMap
    }

    // Method to create a KeyvRedis instance
    private createKeyvRedis(): KeyvRedis<string> {
        return new KeyvRedis(
            createCluster({
                rootNodes: [
                    {
                        url: `redis://${envConfig().databases.redis[RedisType.Cache].host}:${envConfig().databases.redis[RedisType.Cache].port}`,
                    },
                ],
                defaults: {
                    password: envConfig().databases.redis[RedisType.Cache].password || undefined,
                },
                nodeAddressMap: this.nodeAddressMap, // Use class-level nodeAddressMap
            })
        )
    }

    // Method to create a Keyv instance (wrapping around KeyvRedis)
    public createKeyv(): Keyv<string> {
        return new Keyv(this.createKeyvRedis())
    }

    // Method to create KeyvAdater
    public createKeyvAdapter(): KeyvAdapter<string> {
        return new KeyvAdapter(this.createKeyv())
    }
}
