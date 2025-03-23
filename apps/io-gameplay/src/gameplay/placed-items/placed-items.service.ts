import { Injectable } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class PlacedItemsService {
    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async getPlacedItem(id: string): Promise<PlacedItemSchema> {
        return await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(id)
            .select({
                id: 1,
                x: 1,
                y: 1,
                placedItemType: 1,
                "plantInfo.plantType": 1,
                "plantInfo.crop": 1,
                "plantInfo.flower": 1,
                "plantInfo.currentPerennialCount": 1,
                "plantInfo.currentStage": 1,
                "plantInfo.currentState": 1,
                "plantInfo.harvestQuantityRemaining": 1,
                "plantInfo.isFertilized": 1,
                "plantInfo.isQuality": 1,
                "plantInfo.thieves": 1,
                "plantInfo.currentStageTimeElapsed": 1,
                "buildingInfo.currentUpgrade": 1,
                "animalInfo.currentGrowthTime": 1,
                "animalInfo.currentHungryTime": 1,
                "animalInfo.currentYieldTime": 1,
                "animalInfo.harvestQuantityRemaining": 1,
                "animalInfo.isAdult": 1,
                "animalInfo.currentState": 1,
                "animalInfo.isQuality": 1,
                "animalInfo.thieves": 1,
                "fruitInfo.currentStage": 1,
                "fruitInfo.currentStageTimeElapsed": 1,
                "fruitInfo.harvestQuantityRemaining": 1,
                "fruitInfo.isQuality": 1,
                "fruitInfo.thieves": 1
            })
    }

    public async getPlacedItemsByIds({
        placedItemIds
    }: GetPlacedItemsByIdsParams): Promise<Array<PlacedItemSchema>> {
        const placedItems = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({ _id: { $in: placedItemIds } })
            .select({
                id: 1,
                x: 1,
                y: 1,
                placedItemType: 1,
                "plantInfo.crop": 1,
                "plantInfo.flower": 1,
                "plantInfo.currentPerennialCount": 1,
                "plantInfo.currentStage": 1,
                "plantInfo.currentState": 1,
                "plantInfo.harvestQuantityRemaining": 1,
                "plantInfo.isFertilized": 1,
                "plantInfo.plantType": 1,
                "plantInfo.isQuality": 1,
                "plantInfo.thieves": 1,
                "plantInfo.currentStageTimeElapsed": 1,
                "buildingInfo.currentUpgrade": 1,
                "animalInfo.currentGrowthTime": 1,
                "animalInfo.currentHungryTime": 1,
                "animalInfo.currentYieldTime": 1,
                "animalInfo.harvestQuantityRemaining": 1,
                "animalInfo.isAdult": 1,
                "animalInfo.isQuality": 1,
                "animalInfo.currentState": 1,
                "animalInfo.thieves": 1,
                "fruitInfo.currentStage": 1,
                "fruitInfo.currentStageTimeElapsed": 1,
                "fruitInfo.currentState": 1,
                "fruitInfo.harvestQuantityRemaining": 1,
                "fruitInfo.isQuality": 1,
                "fruitInfo.thieves": 1
            })

        return placedItems.map((placedItem) => ({
            ...placedItem.toJSON({
                flattenObjectIds: true
            }),
        }))
    }
}

export interface GetPlacedItemsByIdsParams {
    placedItemIds: Array<string>
}
