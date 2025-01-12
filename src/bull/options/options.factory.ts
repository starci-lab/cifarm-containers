import { Injectable } from "@nestjs/common"
import { RedisType } from "@src/env"
import { InjectIoRedis, IoRedisClientOrCluster } from "@src/native"
import { QueueOptions } from "bullmq"

@Injectable()
export class QueueOptionsFactory {
    constructor(
        //either redis or cluster
        @InjectIoRedis(RedisType.Job)
        private readonly ioRedisClientOrCluster: IoRedisClientOrCluster
    ) {}

    public createQueueOptions(): QueueOptions {
        return {
            connection : this.ioRedisClientOrCluster
        }
    }
}