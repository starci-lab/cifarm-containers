import { KeyvAdapter } from "@apollo/utils.keyvadapter"
import { envConfig } from "@src/env"
import Keyv from "keyv"
import KeyvRedis, { RedisClusterOptions } from "@keyv/redis"

export class CacheKeyv extends Keyv {
    constructor() {
        const clusterOptions : RedisClusterOptions = {
            rootNodes: [
                {
                    url: `redis://${envConfig().databases.redis.cache.host}:${envConfig().databases.redis.cache.port}`,
                    password: envConfig().databases.redis.cache.password,
                }
            ],
            nodeAddressMap: {
                
            }
        }
        super(
            new KeyvRedis(
                {
                    type:""
                }
            )
        )
    }
}
export class CacheAdapter<T> extends KeyvAdapter<T> {
    constructor() {
        super(
            new Keyv(
                new KeyvRedis(
                    `redis://${envConfig().databases.redis.cache.host}:${envConfig().databases.redis.cache.port}`
                )
            )
        )
    }
}
