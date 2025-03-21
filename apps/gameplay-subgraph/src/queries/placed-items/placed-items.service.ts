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

    async getPlacedItems(
        { id }: UserLike,
        { storeAsCache, userId }: PlacedItemsRequest
    ): Promise<Array<PlacedItemSchema>> {
        // return the user id if not provided
        userId = userId || id
        const mongoSession = await this.connection.startSession()
        try {
            const placedItems = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({ user: userId })
                .select({
                    id: 1,
                    x: 1,
                    y: 1,
                    placedItemType: 1,
                    "seedGrowthInfo.currentPerennialCount": 1,
                    "seedGrowthInfo.crop": 1,
                    "seedGrowthInfo.currentStage": 1,
                    "seedGrowthInfo.currentState": 1,
                    "seedGrowthInfo.harvestQuantityRemaining": 1,
                    "seedGrowthInfo.isFertilized": 1,
                    "seedGrowthInfo.isQuality": 1,
                    "seedGrowthInfo.thieves": 1,
                    "seedGrowthInfo.currentStageTimeElapsed": 1,
                    "buildingInfo.currentUpgrade": 1,
                    "animalInfo.currentGrowthTime": 1,
                    "animalInfo.currentHungryTime": 1,
                    "animalInfo.currentYieldTime": 1,
                    "animalInfo.harvestQuantityRemaining": 1,
                    "animalInfo.isAdult": 1,
                    "animalInfo.isQuality": 1,
                    "animalInfo.thieves": 1,
                    "fruitInfo.currentStage": 1,
                    "fruitInfo.currentStageTimeElapsed": 1,
                    "fruitInfo.currentState": 1,
                    "fruitInfo.harvestQuantityRemaining": 1,
                    "fruitInfo.isQuality": 1,
                    "fruitInfo.thieves": 1,
                })
                .session(mongoSession)

            if (storeAsCache) {
                await this.cache.set(
                    getCacheKey(CacheKey.PlacedItems, id),
                    placedItems.map((item) => item.toJSON({
                        flattenObjectIds: true
                    })),
                    0
                )
            }

            return placedItems
        } finally {
            await mongoSession.endSession()
        }
    }
}
