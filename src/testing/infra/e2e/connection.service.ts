import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka } from "@src/brokers"
import { InjectCache } from "@src/cache"
import { InjectPostgreSQL } from "@src/databases"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { E2EGameplaySocketIoService } from "./socket-io"

@Injectable()
export class E2EConnectionService {
    private readonly logger = new Logger(E2EConnectionService.name)
    constructor(
        @InjectCache()
        private readonly cacheManager: Cache,
        @InjectKafka()
        private readonly clientKafka: ClientKafka,
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly e2eGameplaySocketIoService: E2EGameplaySocketIoService
    ) {}

    public async closeAll(): Promise<void> {
        const promises: Array<Promise<void>> = []
        promises.push((async () => {
            await this.cacheManager.disconnect()
        })())
        promises.push((async () => {
            await this.clientKafka.close()
        })())
        promises.push((async () => {
            if (this.dataSource.isInitialized) {
                await this.dataSource.destroy()
            }
        })())
        promises.push((async () => {
            this.e2eGameplaySocketIoService.clear()
        })())
        await Promise.all(promises)
    }
}