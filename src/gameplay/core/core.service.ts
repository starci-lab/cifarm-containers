import { Injectable } from "@nestjs/common"
import {
    ComputeDiseaseResistanceParams,
    ComputeGrowthAccelerationParams,
    ComputeHarvestYieldBonusParams,
    ComputeQualityYieldParams,
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

    public computeGrowthAcceleration({ growthAcceleration }: ComputeGrowthAccelerationParams): number {
        // we use a fomular
        // growthAcceleration/(500+growthAcceleration)
        // to compute the growth acceleration percentage
        const _growthAcceleration = growthAcceleration ?? 0
        return _growthAcceleration / (1000 + _growthAcceleration)
    }

    public computeQualityYield({ qualityYield }: ComputeQualityYieldParams): number {
        // we use a fomular
        // qualityYield/(500+qualityYield)
        // to compute the quality yield percentage
        const _qualityYield = qualityYield ?? 0
        return _qualityYield / (1000 + _qualityYield)
    }

    public computeDiseaseResistance({ diseaseResistance }: ComputeDiseaseResistanceParams): number {
        // we use a fomular
        // diseaseResistance/(500+diseaseResistance)
        // to compute the disease resistance percentage
        const _diseaseResistance = diseaseResistance ?? 0
        return _diseaseResistance / (1000 + _diseaseResistance)
    }   

    public computeHarvestYieldBonus({ harvestYieldBonus }: ComputeHarvestYieldBonusParams): number {
        // we use a fomular
        // harvestYieldBonus/(500+harvestYieldBonus)
        // to compute the harvest yield bonus percentage
        const _harvestYieldBonus = harvestYieldBonus ?? 0
        return _harvestYieldBonus / (1000 + _harvestYieldBonus)
    }
}
