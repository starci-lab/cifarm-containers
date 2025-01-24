import { Injectable } from "@nestjs/common"
import {
    ComputeAnimalQualityChanceParams,
    ComputeTileQualityChanceParams,
    UpdateAnimalInfoAfterCollectParams,
    UpdateAnimalInfoAfterCollectResult,
    UpdateTileInfoAfterHarvestParams,
    UpdateTileInfoAfterHarvestResult
} from "./booster.types"

//booster service is to compute the quality,.. of tile, animal after several time of harvest
@Injectable()
export class BoosterService {
    constructor() {}

    //compute the quality of animal after several time of harvest
    public computeAnimalQualityChance({
        entity,
        qualityProductChanceLimit,
        qualityProductChanceStack
    }: ComputeAnimalQualityChanceParams): number {
        let { yieldCount } = entity
        yieldCount += 1
        return Math.min(qualityProductChanceLimit, qualityProductChanceStack * yieldCount)
    }

    //compute the quality of tile after several time of harvest
    public computeTileQualityChance({
        entity,
        qualityProductChanceLimit,
        qualityProductChanceStack
    }: ComputeTileQualityChanceParams): number {
        let { harvestCount } = entity
        harvestCount += 1
        return Math.min(qualityProductChanceLimit, qualityProductChanceStack * harvestCount)
    }

    //update the tile information after harvest
    public updateTileInfoAfterHarvest({
        entity
    }: UpdateTileInfoAfterHarvestParams): UpdateTileInfoAfterHarvestResult {
        const harvestCount = entity.harvestCount + 1
        return {
            harvestCount
        }
    }

    //update the animal information after collect
    public updateAnimalInfoAfterCollect({
        entity
    }: UpdateAnimalInfoAfterCollectParams): UpdateAnimalInfoAfterCollectResult {
        const yieldCount = entity.yieldCount + 1
        return {
            yieldCount
        }
    }
}
