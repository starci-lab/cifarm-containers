import { Injectable, Logger } from "@nestjs/common"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { E2EGameplaySocketIoService } from "./socket-io"
import { Connection } from "mongoose"
import { InjectMongoose } from "@src/databases"
import { InjectKafkaProducer } from "@src/brokers"
import { Producer } from "@nestjs/microservices/external/kafka.interface"

@Injectable()
export class E2EConnectionService {
    private readonly logger = new Logger(E2EConnectionService.name)
    constructor(
        @InjectCache()
        private readonly cacheManager: Cache,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly e2eGameplaySocketIoService: E2EGameplaySocketIoService
    ) {}

    public async closeAll(): Promise<void> {
        const promises: Array<Promise<void>> = []
        promises.push((async () => {
            await this.cacheManager.disconnect()
        })())
        promises.push((async () => {
            await this.kafkaProducer.disconnect()
        })())
        promises.push((async () => {
            await this.connection.close()
        })())
        promises.push((async () => {
            this.e2eGameplaySocketIoService.clear()
        })())
        await Promise.all(promises)
    }
}