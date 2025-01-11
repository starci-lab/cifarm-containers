import { Inject } from "@nestjs/common"
import { REDIS } from "./redis.constants"

export const InjectRedis = () => Inject(REDIS)