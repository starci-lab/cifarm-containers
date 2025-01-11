import { RedisType } from "@src/env"
import { Redis, Cluster } from "ioredis"

export interface IoRedisOptions {
    type?: RedisType
}

export type IoRedisClientOrCluster = Redis | Cluster