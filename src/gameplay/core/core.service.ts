import { Injectable } from "@nestjs/common"
import {
    ComputeAnimalQualityChanceParams,
    ComputeFruitQualityChanceParams,
    ComputeTileQualityChanceParams,
    UpdatePlacedItemAnimalAfterHarvestParams,
    UpdatePlacedItemAnimalAfterHarvestResult,
    UpdatePlacedItemFruitAfterHarvestParams,
    UpdatePlacedItemFruitAfterHarvestResult,
    UpdatePlacedItemTileAfterHarvestParams,
    UpdatePlacedItemTileAfterHarvestResult,
    UpdatePlacedItemTileAfterUseFertilizerParams,
    UpdatePlacedItemTileAfterUseFertilizerResult
} from "./types"
import { AnimalCurrentState, CropCurrentState, FruitCurrentState } from "@src/databases"

//core game logic service
@Injectable()
export class CoreService {
    constructor() {}

    //compute the quality of animal after several time of harvest
    public computeAnimalQualityChance({
        placedItemAnimal,
        animal
    }: ComputeAnimalQualityChanceParams): number {
        return Math.min(
            animal.qualityProductChanceLimit,
            animal.qualityProductChanceStack * placedItemAnimal.animalInfo.timesHarvested
        )
    }

    //compute the quality of tile after several time of harvest
    public computeTileQualityChance({
        placedItemTile,
        tile
    }: ComputeTileQualityChanceParams): number {
        return Math.min(
            tile.qualityProductChanceLimit,
            tile.qualityProductChanceStack * placedItemTile.tileInfo.timesHarvested
        )
    }

    public computeFruitQualityChance({
        placedItemFruit,
        fruit
    }: ComputeFruitQualityChanceParams): number {
        return Math.min(
            fruit.qualityProductChanceLimit,
            fruit.qualityProductChanceStack * placedItemFruit.fruitInfo.timesHarvested
        )
    }

    //update the tile information after harvest
    public updatePlacedItemTileAfterHarvest({
        placedItemTile,
        crop,
        cropInfo
    }: UpdatePlacedItemTileAfterHarvestParams): UpdatePlacedItemTileAfterHarvestResult {
        // update the tile info times harvested
        placedItemTile.tileInfo.timesHarvested += 1

        if (placedItemTile.seedGrowthInfo.harvestCount + 1 >= crop.perennialCount) {
            // remove the seed growth info
            placedItemTile.seedGrowthInfo = undefined
        } else {
            // update the seed growth info
            placedItemTile.seedGrowthInfo.harvestCount += 1
            placedItemTile.seedGrowthInfo.currentState = CropCurrentState.Normal
            placedItemTile.seedGrowthInfo.currentStage = cropInfo.nextGrowthStageAfterHarvest
            placedItemTile.seedGrowthInfo.currentStageTimeElapsed = 0
            placedItemTile.seedGrowthInfo.harvestQuantityRemaining = 0
            placedItemTile.seedGrowthInfo.isQuality = false
        }
        return placedItemTile
    }

    //update the animal information after collect
    public updatePlacedItemAnimalAfterHarvest({
        placedItemAnimal,
        animal
    }: UpdatePlacedItemAnimalAfterHarvestParams): UpdatePlacedItemAnimalAfterHarvestResult {
        // update the animal info times harvested
        placedItemAnimal.animalInfo.timesHarvested += 1

        placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Normal
        placedItemAnimal.animalInfo.currentYieldTime = 0
        placedItemAnimal.animalInfo.currentHungryTime = 0
        placedItemAnimal.animalInfo.currentState = AnimalCurrentState.Hungry
        placedItemAnimal.animalInfo.harvestQuantityRemaining = 0

        return placedItemAnimal
    }

    //public method to update the fruit information after harvest
    public updatePlacedItemFruitAfterHarvest({
        placedItemFruit,
        fruitInfo
    }: UpdatePlacedItemFruitAfterHarvestParams): UpdatePlacedItemFruitAfterHarvestResult {
        // update the fruit info harvest time
        placedItemFruit.fruitInfo.timesHarvested += 1

        // update the fruit info
        placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
        placedItemFruit.fruitInfo.currentStage = fruitInfo.nextGrowthStageAfterHarvest
        placedItemFruit.fruitInfo.currentStageTimeElapsed = 0
        placedItemFruit.fruitInfo.harvestQuantityRemaining = 0
        // return the placed item fruit
        return placedItemFruit
    }

    //update the tile information after use fertilizer
    public updatePlacedItemTileAfterUseFertilizer({
        placedItemTile,
        supply
    }: UpdatePlacedItemTileAfterUseFertilizerParams): UpdatePlacedItemTileAfterUseFertilizerResult {
        placedItemTile.seedGrowthInfo.currentStageTimeElapsed += supply.fertilizerEffectTimeReduce
        placedItemTile.seedGrowthInfo.isFertilized = true
        // return the placed item tile
        return placedItemTile
    }
}
