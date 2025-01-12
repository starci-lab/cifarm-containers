import { Inject } from "@nestjs/common"
import { RedisType } from "@src/env"
import { getRedisToken } from "./redis.utils"

export const InjectRedis = (type: RedisType = RedisType.Cache) => Inject(getRedisToken(type))