import { RedisType } from "@src/env"
import { RedisClientType, RedisClusterType } from "redis"

export interface RedisOptions {
    type?: RedisType
}

export type RedisClientOrCluster = RedisClientType | RedisClusterType