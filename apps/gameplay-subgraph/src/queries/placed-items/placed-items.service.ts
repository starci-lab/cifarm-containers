import { Injectable, Logger } from "@nestjs/common"
import { CacheKey, getCacheKey, InjectCache } from "@src/cache"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"
import { Cache } from "cache-manager"
import { PlacedItemsRequest } from "./placed-items.dto"

@Injectable()
export class PlacedItemsService {
    private readonly logger = new Logger(PlacedItemsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cache: Cache
    ) {}

    async getPlacedItem(id: string): Promise<PlacedItemSchema> {
        const mongoSession = await this.connection.startSession()
        try {
            return await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(id)
                .session(mongoSession)
        } finally {
            await mongoSession.endSession()
        }
    }

    async getPlacedItems({ id }: UserLike, { storeAsCache }: PlacedItemsRequest): Promise<Array<PlacedItemSchema>> {
        const mongoSession = await this.connection.startSession()
        try {
            const placedItems = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({ user: id })
                .session(mongoSession)

            if (storeAsCache) {
                await this.cache.set(
                    getCacheKey(CacheKey.PlacedItems, id),
                    placedItems
                )
            }

            return placedItems
        } finally {
            await mongoSession.endSession()
        }
    }
}
