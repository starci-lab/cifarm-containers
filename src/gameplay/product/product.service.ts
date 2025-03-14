import { Injectable } from "@nestjs/common"
import {
    ComputeAnimalQualityChanceParams,
    ComputeTileQualityChanceParams,
    UpdateAnimalInfoAfterCollectParams,
    UpdateAnimalInfoAfterCollectResult,
    UpdateTileInfoAfterHarvestParams,
    UpdateTileInfoAfterHarvestResult
} from "./product.types"
import { AnimalCurrentState } from "@src/databases"

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
            harvestQuantityRemaining: 0
        }
    }
}
