import { Inject, Injectable } from "@nestjs/common"
import { IoRedisClientOrCluster, IOREDIS } from "@src/native"
import { QueueOptions } from "bullmq"

@Injectable()
export class QueueOptionsFactory {
    constructor(
        //either redis or cluster
        @Inject(IOREDIS)
        private readonly ioRedisClientOrCluster: IoRedisClientOrCluster
    ) {}

    public createQueueOptions(): QueueOptions {
        return {
            connection : this.ioRedisClientOrCluster
        }
    }
}