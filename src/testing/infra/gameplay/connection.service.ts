import { Injectable } from "@nestjs/common"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { InjectKafkaProducer } from "@src/brokers"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { Producer } from "@nestjs/microservices/external/kafka.interface"

@Injectable()
export class GameplayConnectionService {
    constructor(
            @InjectMongoose()
            private readonly connection: Connection,
            @InjectCache()
            private readonly cacheManager: Cache,
            @InjectKafkaProducer()
            private readonly kafkaProducer: Producer
    ) { }
    public async closeAll(): Promise<void> {
        const promises: Array<Promise<void>> = []
        promises.push((async () => {
            await this.connection.close()
        })())
        promises.push((async () => {
            await this.cacheManager.disconnect()
        })())
        promises.push((async () => {
            await this.kafkaProducer.disconnect()
        })())
        await Promise.all(promises)
    }
}