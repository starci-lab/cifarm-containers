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
    UpdatePlacedItemTileAfterHarvestResult
} from "./product.types"
import { AnimalCurrentState, CropCurrentState, FruitCurrentState } from "@src/databases"

//booster service is to compute the quality,.. of tile, animal after several time of harvest
@Injectable()
export class ProductService {
    constructor() {}

    //compute the quality of animal after several time of harvest
    public computeAnimalQualityChance({
        animalInfo: { timesHarvested },
        qualityProductChanceLimit,
        qualityProductChanceStack
    }: ComputeAnimalQualityChanceParams): number {
        timesHarvested += 1
        return Math.min(qualityProductChanceLimit, qualityProductChanceStack * timesHarvested)
    }

    //compute the quality of tile after several time of harvest
    public computeTileQualityChance({
        tileInfo: { timesHarvested },
        qualityProductChanceLimit,
        qualityProductChanceStack
    }: ComputeTileQualityChanceParams): number {
        timesHarvested += 1
        return Math.min(qualityProductChanceLimit, qualityProductChanceStack * timesHarvested)
    }

    public computeFruitQualityChance({
        fruitInfo: { timesHarvested },
        qualityProductChanceLimit,
        qualityProductChanceStack
    }: ComputeFruitQualityChanceParams): number {
        timesHarvested += 1
        return Math.min(qualityProductChanceLimit, qualityProductChanceStack * timesHarvested)
    }


    //update the tile information after harvest
    public updatePlacedItemTileAfterHarvest({
        placedItemTile,
        crop
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
            placedItemTile.seedGrowthInfo.currentStage = crop.nextGrowthStageAfterHarvest
            placedItemTile.seedGrowthInfo.currentStageTimeElapsed = 0
            placedItemTile.seedGrowthInfo.harvestQuantityRemaining = crop.maxHarvestQuantity
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

        // update the animal info
        placedItemAnimal.animalInfo.animal = animal
       
        return placedItemAnimal
    }

    //public method to update the fruit information after harvest
    public updatePlacedItemFruitAfterHarvest({
        placedItemFruit,
        fruit
    }: UpdatePlacedItemFruitAfterHarvestParams): UpdatePlacedItemFruitAfterHarvestResult {
        // update the fruit info harvest time
        placedItemFruit.fruitInfo.timesHarvested += 1

        // update the fruit info
        placedItemFruit.fruitInfo.currentState = FruitCurrentState.Normal
        placedItemFruit.fruitInfo.currentStage = fruit.nextGrowthStageAfterHarvest
        placedItemFruit.fruitInfo.currentStageTimeElapsed = 0
        placedItemFruit.fruitInfo.harvestQuantityRemaining = 0
        // return the placed item fruit
        return placedItemFruit
    }
}
