import { RedisType } from "@src/env"

export const getIoRedisToken = (type: RedisType = RedisType.Cache) => `IOREDIS_${type}`