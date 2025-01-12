import { INestApplication, Injectable } from "@nestjs/common"
import { InjectRedis, RedisClientOrCluster } from "@src/native"
import { RedisIoAdapter } from "./redis.adapter"
import { RedisType } from "@src/env"
import { IoAdapterFactory } from "../../io.types"

@Injectable()
export class RedisIoAdapterFactory implements IoAdapterFactory {
    constructor(
        @InjectRedis(RedisType.Adapter)
        private readonly redisClientOrCluster: RedisClientOrCluster,
    ) {}

    public createAdapter(app: INestApplication) {
        const adapter = new RedisIoAdapter(app)
        adapter.setClient(this.redisClientOrCluster)
        return adapter
    }
}