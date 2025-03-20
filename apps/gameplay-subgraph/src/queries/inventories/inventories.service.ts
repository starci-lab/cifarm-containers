import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, InventorySchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"
import { InjectCache, getCacheKey, CacheKey } from "@src/cache"
import { Cache } from "cache-manager"
import { InventoriesRequest } from "./inventories.dto"

@Injectable()
export class InventoriesService {
    private readonly logger = new Logger(InventoriesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cache: Cache
    ) {}

    async getInventory(id: string): Promise<InventorySchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection
                .model(InventorySchema.name)
                .findById(id)
                .session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getInventories(
        { id }: UserLike,
        { storeAsCache }: InventoriesRequest
    ): Promise<Array<InventorySchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            const inventories = await this.connection
                .model(InventorySchema.name)
                .find({
                    user: id
                })
                .session(mongoSession)

            if (storeAsCache) {
                await this.cache.set(getCacheKey(CacheKey.Inventories, id), inventories)
            }

            return inventories
        } finally {
            await mongoSession.endSession()
        }
    }
}
