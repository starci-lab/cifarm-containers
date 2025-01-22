import { Injectable } from "@nestjs/common"
import { InjectCache } from "@src/cache"
import { InjectPostgreSQL } from "@src/databases"
import { DataSource } from "typeorm"
import { Cache } from "cache-manager"
import { InjectKafka } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class GameplayConnectionService {
    constructor(
            @InjectPostgreSQL()
            private readonly dataSource: DataSource,
            @InjectCache()
            private readonly cacheManager: Cache,
            @InjectKafka()
            private readonly clientKafka: ClientKafka
    ) { }
    public async closeAll(): Promise<void> {
        const promises: Array<Promise<void>> = []
        promises.push((async () => {
            if (this.dataSource.isInitialized) {
                await this.dataSource.destroy()
            }
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