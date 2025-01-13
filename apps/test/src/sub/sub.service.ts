import { Injectable, OnModuleInit } from "@nestjs/common"

@Injectable()
export class SubService implements OnModuleInit {
    constructor(
        // @InjectPostgreSQL()
        // private readonly dataSource: DataSource,
        // @InjectCache()
        // private readonly cache: Cache,
        // @InjectQueue(BullQueueName.Crop)
        // private readonly queue: Queue,
        // @InjectQueue(BullQueueName.Animal)
        // private readonly animalQueue: Queue,
        // @InjectKafka()
        // private readonly kafka: ClientKafka,
        // private readonly leaderElectionService: LeaderElectionService
    ) {
    }
    async onModuleInit() {
        // const t = await this.dataSource.manager.find(AnimalEntity)
        // // const hentaiz = await this.queue.addBulk([
        // //     { name: "1", data: "hentai" },
        // //     { name: "2", data: "hentai" }
        // // ])
        // console.log(this.animalQueue)
        // // console.log(this.kafka)
        // // const iaoli = this.kafka.send("test", "hentai")
        // console.log(this..isLeaderInstance())
    }
}