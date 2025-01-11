import { RedisType } from "@src/env"

export interface DebugRedisClusterOptions {
    type?: RedisType
    // check whether the keys is existed
    keys?: Array<string>
}