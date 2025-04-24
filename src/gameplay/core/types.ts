import {
    AbstractPlantSchema,
    AnimalInfo,
    AnimalSchema,
    FruitInfo,
    FruitSchema,
    PlacedItemSchema,
    SupplySchema
} from "@src/databases"

export interface UpdatePlacedItemTileAfterHarvestParams {
    placedItemTile: PlacedItemSchema
    plant: AbstractPlantSchema
    plantInfo: PlantInfoLike
}
export interface UpdatePlacedItemFruitAfterHarvestParams {
    placedItemFruit: PlacedItemSchema
    fruit: FruitSchema
    fruitInfo: FruitInfo
}

export interface UpdatePlacedItemAnimalAfterHarvestParams {
    placedItemAnimal: PlacedItemSchema
    animal: AnimalSchema
    animalInfo: AnimalInfo
}
export interface UpdatePlacedItemTileAfterUseFertilizerParams {
    placedItemTile: PlacedItemSchema
    supply: SupplySchema
}
export interface PlantInfoLike {
    nextGrowthStageAfterHarvest: number
    growthStages: number
    randomness: RandomnessLike
}

export interface RandomnessLike {
    thief2: number
    thief3: number
}

export interface UpdatePlacedItemBuildingBeeHouseAfterHarvestParams {
    placedItemBuilding: PlacedItemSchema
}

export interface ComputeGrowthAccelerationParams {
    growthAcceleration: number
}

export interface ComputeQualityYieldParams {
    qualityYield: number
}

export interface ComputeDiseaseResistanceParams {
    diseaseResistance: number
}

export interface ComputeHarvestYieldBonusParams {
    harvestYieldBonus: number
}
