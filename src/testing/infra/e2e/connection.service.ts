import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka } from "@src/brokers"
import { InjectCache } from "@src/cache"
import { InjectPostgreSQL } from "@src/databases"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { InjectSocketIo, IoService } from "./socket-io"
import { Socket } from "socket.io-client"

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
        @InjectSocketIo(IoService.IoGameplay)
        private readonly socket: Socket
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
            this.socket.disconnect()
        })())
        await Promise.all(promises)
    }
}