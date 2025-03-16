import { Injectable } from "@nestjs/common"
import {
    ComputeAnimalQualityChanceParams,
    ComputeFruitQualityChanceParams,
    ComputeTileQualityChanceParams,
    UpdateAnimalInfoAfterCollectParams,
    UpdateAnimalInfoAfterCollectResult,
    UpdateFruitInfoAfterHarvestParams,
    UpdateFruitInfoAfterHarvestResult,
    UpdateTileInfoAfterHarvestParams,
    UpdateTileInfoAfterHarvestResult
} from "./product.types"
import { AnimalCurrentState, FruitCurrentState } from "@src/databases"

//booster service is to compute the quality,.. of tile, animal after several time of harvest
@Injectable()
export class ProductService {
    constructor() {}

    //compute the quality of animal after several time of harvest
    public computeAnimalQualityChance({
        animalInfo: { yieldCount },
        qualityProductChanceLimit,
        qualityProductChanceStack
    }: ComputeAnimalQualityChanceParams): number {
        yieldCount += 1
        return Math.min(qualityProductChanceLimit, qualityProductChanceStack * yieldCount)
    }

    //compute the quality of tile after several time of harvest
    public computeTileQualityChance({
        tileInfo: { harvestCount },
        qualityProductChanceLimit,
        qualityProductChanceStack
    }: ComputeTileQualityChanceParams): number {
        harvestCount += 1
        return Math.min(qualityProductChanceLimit, qualityProductChanceStack * harvestCount)
    }

    public computeFruitQualityChance({
        fruitInfo: { harvestCount },
        qualityProductChanceLimit,
        qualityProductChanceStack
    }: ComputeFruitQualityChanceParams): number {
        harvestCount += 1
        return Math.min(qualityProductChanceLimit, qualityProductChanceStack * harvestCount)
    }


    //update the tile information after harvest
    public updateTileInfoAfterHarvest({
        tileInfo
    }: UpdateTileInfoAfterHarvestParams): UpdateTileInfoAfterHarvestResult {
        const harvestCount = tileInfo.harvestCount + 1
        return {
            harvestCount
        }
    }

    //update the animal information after collect
    public updateAnimalInfoAfterCollect({
        animalInfo
    }: UpdateAnimalInfoAfterCollectParams): UpdateAnimalInfoAfterCollectResult {
        const yieldCount = animalInfo.yieldCount + 1
        return {
            yieldCount,
            currentState: AnimalCurrentState.Normal,
            harvestQuantityRemaining: 0,
            currentHungryTime: 0,
            animal: animalInfo.animal
        }
    }

    //public method to update the fruit information after harvest
    public updateFruitInfoAfterHarvest({
        fruitInfo,
        fruit
    }: UpdateFruitInfoAfterHarvestParams): UpdateFruitInfoAfterHarvestResult {
        const harvestCount = fruitInfo.harvestCount + 1
        return {
            harvestCount,
            currentState: FruitCurrentState.Normal,
            currentStage: fruit.nextGrowthStageAfterHarvest,
            currentStageTimeElapsed: 0,
            harvestQuantityRemaining: 0,
            fruit: fruit._id
        }
    }
}
