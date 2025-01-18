import { Injectable } from "@nestjs/common"
import { InjectCache } from "@src/cache"
import { InjectPostgreSQL } from "@src/databases"
import { DataSource } from "typeorm"
import { Cache } from "cache-manager"

@Injectable()
export class ConnectionService {
    constructor(
            @InjectPostgreSQL()
            private readonly dataSource: DataSource,
            @InjectCache()
            private readonly cacheManager: Cache,
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
        await Promise.all(promises)
    }
}