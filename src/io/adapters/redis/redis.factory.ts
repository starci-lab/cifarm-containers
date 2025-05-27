import { INestApplication, Injectable } from "@nestjs/common"
import { InjectIoRedis, IoRedisClientOrCluster } from "@src/native"
import { RedisIoAdapter } from "./redis.adapter"
import { RedisType } from "@src/env"
import { IoAdapterFactory } from "../../io.types"

@Injectable()
export class RedisIoAdapterFactory implements IoAdapterFactory {
    constructor(
        @InjectIoRedis(RedisType.Adapter)
        private readonly redisClientOrCluster: IoRedisClientOrCluster,
    ) {}

    public createAdapter(app: INestApplication) {
        const adapter = new RedisIoAdapter(app)
        adapter.setClient(this.redisClientOrCluster)
        return adapter
    }
}