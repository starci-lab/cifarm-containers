import { Inject } from "@nestjs/common"
import { RedisType } from "@src/env"
import { getIoRedisToken } from "./ioredis.utils"

export const InjectIoRedis = (type: RedisType = RedisType.Cache) => Inject(getIoRedisToken(type))