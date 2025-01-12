import { Injectable } from "@nestjs/common"
import { InjectIoRedis, IoRedisClientOrCluster } from "@src/native"
import { QueueOptions } from "bullmq"

@Injectable()
export class QueueOptionsFactory {
    constructor(
        //either redis or cluster
        @InjectIoRedis()
        private readonly ioRedisClientOrCluster: IoRedisClientOrCluster
    ) {}

    public createQueueOptions(): QueueOptions {
        return {
            connection : this.ioRedisClientOrCluster
        }
    }
}