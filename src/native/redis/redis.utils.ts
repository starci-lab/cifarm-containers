import { RedisType } from "@src/env"

export const getRedisToken = (type: RedisType = RedisType.Cache) => `REDIS_${type}`