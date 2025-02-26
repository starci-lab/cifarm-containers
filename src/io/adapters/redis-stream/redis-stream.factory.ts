import { INestApplication, Injectable } from "@nestjs/common"
import { InjectRedis, RedisClientOrCluster } from "@src/native"
import { RedisStreamIoAdapter } from "./redis-stream.adapter"
import { RedisType } from "@src/env"
import { IoAdapterFactory } from "../../io.types"

@Injectable()
export class RedisStreamIoAdapterFactory implements IoAdapterFactory {
    constructor(
        @InjectRedis(RedisType.Adapter)
        private readonly redisClientOrCluster: RedisClientOrCluster,
    ) {}

    public createAdapter(app: INestApplication) {
        const adapter = new RedisStreamIoAdapter(app)
        adapter.setClient(this.redisClientOrCluster)
        return adapter
    }
}