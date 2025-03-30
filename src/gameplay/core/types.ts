import {
    AbstractPlantSchema,
    AnimalInfo,
    AnimalSchema,
    FruitInfo,
    FruitSchema,
    PlacedItemSchema,
    SupplySchema,
    TileSchema
} from "@src/databases"

export interface ComputeAnimalQualityChanceParams {
    placedItemAnimal: PlacedItemSchema
    animal: AnimalSchema
}

export interface ComputeTileQualityChanceParams {
    placedItemTile: PlacedItemSchema
    tile: TileSchema
}

export interface ComputeFruitQualityChanceParams {
    placedItemFruit: PlacedItemSchema
    fruit: FruitSchema
}

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