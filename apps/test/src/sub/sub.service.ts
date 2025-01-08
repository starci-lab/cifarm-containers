import { Injectable, OnModuleInit } from "@nestjs/common"
import { InjectCache } from "@src/cache"
import { AnimalEntity, InjectPostgreSQL } from "@src/databases"
import { DataSource } from "typeorm"
import { Cache } from "cache-manager"
import { BullQueueName, InjectQueue } from "@src/bull"
import { Queue } from "bullmq"
import { InjectKafka } from "@src/brokers/kafka/kafka.decorators"
import { ClientKafka } from "@nestjs/microservices"
import { LeaderElectionService } from "@src/leader-election"

@Injectable()
export class SubService implements OnModuleInit {
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        @InjectCache()
        private readonly cache: Cache,
        @InjectQueue(BullQueueName.Crop)
        private readonly queue: Queue,
        @InjectQueue(BullQueueName.Animal)
        private readonly animalQueue: Queue,
        @InjectKafka()
        private readonly kafka: ClientKafka,
        private readonly leaderElectionService: LeaderElectionService
    ) {
    }
    async onModuleInit() {
        // const t = await this.dataSource.manager.find(AnimalEntity)
        // const hentaiz = await this.queue.addBulk([
        //     { name: "1", data: "hentai" },
        //     { name: "2", data: "hentai" }
        // ])
        console.log(this.animalQueue)
        // console.log(this.kafka)
        // const iaoli = this.kafka.send("test", "hentai")
        console.log(this.leaderElectionService.isLeaderInstance())
    }
}