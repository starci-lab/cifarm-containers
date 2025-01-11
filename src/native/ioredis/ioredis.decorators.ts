import { Inject } from "@nestjs/common"
import { IOREDIS } from "./ioredis.constants"

export const InjectIoRedis = () => Inject(IOREDIS)