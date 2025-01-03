import { KeyvAdapter } from "@apollo/utils.keyvadapter"
import { envConfig } from "@src/env"
import Keyv from "keyv"
import KeyvRedis from "@keyv/redis"

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
