import { Injectable } from "@nestjs/common"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { InjectKafka } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class GameplayConnectionService {
    constructor(
            @InjectMongoose()
            private readonly connection: Connection,
            @InjectCache()
            private readonly cacheManager: Cache,
            @InjectKafka()
            private readonly clientKafka: ClientKafka
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
            await this.clientKafka.close()
        })())
        await Promise.all(promises)
    }
}