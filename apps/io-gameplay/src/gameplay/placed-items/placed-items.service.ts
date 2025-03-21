import { Injectable } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { GetPlacedItemsParams } from "./placed-items.types"
import { Connection } from "mongoose"
import { CacheKey, getCacheKey, InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { ObjectService } from "@src/object"
import { DeepPartial } from "@src/common"
@Injectable()
export class PlacedItemsService {
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cache: Cache,
        private readonly objectService: ObjectService
    ) {}

    public async getPlacedItems({
        userId
    }: GetPlacedItemsParams): Promise<Array<DeepPartial<PlacedItemSchema>>> {
        const mongoSession = await this.connection.startSession()
        try {
            const cachedPlacedItems = (await this.cache.get(
                getCacheKey(CacheKey.PlacedItems, userId)
            )) as Array<PlacedItemSchema>
            // get the placed items from the database, only select the fields that are needed
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
                }).session(mongoSession)
            await this.cache.set(
                getCacheKey(CacheKey.PlacedItems, userId),
                placedItems.map((item) => item.toJSON({
                    flattenObjectIds: true
                })),
                0
            )
            // get the the diff object between the cached items and the new items
            const diff = this.objectService.getDifferenceBetweenArrays(
                cachedPlacedItems,
                placedItems.map((item) => item.toJSON({
                    flattenObjectIds: true
                })),
                {
                    excludeKey: "id"
                }   
            )
            return diff
        } finally {
            await mongoSession.endSession()
        }
    }
}
