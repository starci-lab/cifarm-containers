import { RedisType } from "@src/env"
import { Redis, Cluster, RedisOptions } from "ioredis"

export interface IoRedisOptions {
    type?: RedisType
    // if true, will only use the options, no connection is ebstablished
    optionsOnly?: boolean
    // additional options for ioredis
    additionalOptions?: RedisOptions
}

export type IoRedisClientOrCluster = Redis | Cluster