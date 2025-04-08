import { Injectable } from "@nestjs/common"
import {
    ComputeAnimalQualityChanceParams,
    ComputeFruitQualityChanceParams,
    ComputeTileQualityChanceParams,
    UpdatePlacedItemAnimalAfterHarvestParams,
    UpdatePlacedItemBuildingBeeHouseAfterHarvestParams,
    UpdatePlacedItemFruitAfterHarvestParams,
    UpdatePlacedItemTileAfterHarvestParams,
    UpdatePlacedItemTileAfterUseFertilizerParams
} from "./types"
import {
    AnimalCurrentState,
    BeeHouseCurrentState,
    CropSchema,
    FruitCurrentState,
    PlacedItemSchema,
    PlantCurrentState,
    PlantType
} from "@src/databases"

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
            animal.qualityProductChanceStack * placedItemAnimal.animalInfo.harvestCount
        )
    }

    //compute the quality of tile after several time of harvest
    public computeTileQualityChance({
        placedItemTile,
        tile
    }: ComputeTileQualityChanceParams): number {
        return Math.min(
            tile.qualityProductChanceLimit,
            tile.qualityProductChanceStack * placedItemTile.tileInfo.harvestCount
        )
    }

    public computeFruitQualityChance({
        placedItemFruit,
        fruit
    }: ComputeFruitQualityChanceParams): number {
        return Math.min(
            fruit.qualityProductChanceLimit,
            fruit.qualityProductChanceStack * placedItemFruit.fruitInfo.harvestCount
        )
    }

    //update the tile information after harvest
    public updatePlacedItemTileAfterHarvest({
        placedItemTile,
        plant,
        plantInfo
    }: UpdatePlacedItemTileAfterHarvestParams): PlacedItemSchema {
        const plantType = placedItemTile.plantInfo.plantType
        // update the tile info times harvested
        placedItemTile.tileInfo.harvestCount += 1
        const tryParseCrop = plant as CropSchema
        // perental only work for crop, flower not have perenial count
        const isPerennial =
            plantType === PlantType.Crop &&
            placedItemTile.plantInfo.harvestCount + 1 < tryParseCrop.perennialCount

        if (!isPerennial) {
            // remove the seed growth info
            placedItemTile.plantInfo = undefined
        } else {
            // update the seed growth info
            placedItemTile.plantInfo.harvestCount += 1
            placedItemTile.plantInfo.currentState = PlantCurrentState.NeedWater
            placedItemTile.plantInfo.currentStage = plantInfo.nextGrowthStageAfterHarvest - 1
            placedItemTile.plantInfo.currentStageTimeElapsed = 0
            placedItemTile.plantInfo.harvestQuantityRemaining = 0
            placedItemTile.plantInfo.isQuality = false
        }
        return placedItemTile
    }

    //update the animal information after collect
    public updatePlacedItemAnimalAfterHarvest({
        placedItemAnimal
    }: UpdatePlacedItemAnimalAfterHarvestParams): PlacedItemSchema {
        // update the animal info times harvested
        placedItemAnimal.animalInfo.harvestCount += 1

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
    }: UpdatePlacedItemFruitAfterHarvestParams): PlacedItemSchema {
        // update the fruit info harvest time
        placedItemFruit.fruitInfo.harvestCount += 1

        // update the fruit info
        placedItemFruit.fruitInfo.currentState = FruitCurrentState.NeedFertilizer
        placedItemFruit.fruitInfo.currentStage = fruitInfo.nextGrowthStageAfterHarvest - 1
        placedItemFruit.fruitInfo.currentStageTimeElapsed = 0
        placedItemFruit.fruitInfo.harvestQuantityRemaining = 0
        // return the placed item fruit
        return placedItemFruit
    }

    //update the tile information after use fertilizer
    public updatePlacedItemTileAfterUseFertilizer({
        placedItemTile,
        supply
    }: UpdatePlacedItemTileAfterUseFertilizerParams): PlacedItemSchema {
        placedItemTile.plantInfo.currentStageTimeElapsed += supply.fertilizerEffectTimeReduce
        placedItemTile.plantInfo.isFertilized = true
        // return the placed item tile
        return placedItemTile
    }

    public updatePlacedItemBuildingBeeHouseAfterHarvest({
        placedItemBuilding
    }: UpdatePlacedItemBuildingBeeHouseAfterHarvestParams): PlacedItemSchema {
        placedItemBuilding.beeHouseInfo.harvestQuantityRemaining = 0
        placedItemBuilding.beeHouseInfo.harvestQuantityDesired = 0
        placedItemBuilding.beeHouseInfo.currentState = BeeHouseCurrentState.Normal
        return placedItemBuilding
    }
}
