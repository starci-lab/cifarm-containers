import { RedisType } from "@src/env"
import { Redis, Cluster } from "ioredis"

export interface IoRedisOptions {
    type?: RedisType
    // if true, will only use the options, no connection is ebstablished
    optionsOnly?: boolean
}

export type IoRedisClientOrCluster = Redis | Cluster