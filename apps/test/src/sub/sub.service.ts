import { Injectable, OnModuleInit } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { InjectCache } from "@src/cache"
import { AnimalEntity, getPostgreSqlDataSourceName, InjectPostgreSQL } from "@src/databases"
import { DataSource } from "typeorm"
import { Cache } from "cache-manager"
import { BullQueueName, InjectQueue } from "@src/bull"
import { Queue } from "bullmq"

@Injectable()
export class SubService implements OnModuleInit {
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        @InjectCache()
        private readonly cache: Cache,
        @InjectQueue(BullQueueName.Crop)
        private readonly queue: Queue
    ) {
    }
    async onModuleInit() {
        const t = await this.dataSource.manager.find(AnimalEntity)
        const hentaiz = await this.queue.addBulk([
            { name: "1", data: "hentai" },
            { name: "2", data: "hentai" }
        ])
        console.log(hentaiz)
    }
}