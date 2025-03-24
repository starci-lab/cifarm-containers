import {
    AbstractPlantSchema,
    AnimalInfo,
    AnimalSchema,
    CropInfo,
    FlowerInfo,
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

export type UpdatePlacedItemTileAfterHarvestResult = PlacedItemSchema

export interface UpdatePlacedItemFruitAfterHarvestParams {
    placedItemFruit: PlacedItemSchema
    fruit: FruitSchema
    fruitInfo: FruitInfo
}

export type UpdatePlacedItemFruitAfterHarvestResult = PlacedItemSchema

export interface UpdatePlacedItemAnimalAfterHarvestParams {
    placedItemAnimal: PlacedItemSchema
    animal: AnimalSchema
    animalInfo: AnimalInfo
}

export type UpdatePlacedItemAnimalAfterHarvestResult = PlacedItemSchema

export interface UpdatePlacedItemTileAfterUseFertilizerParams {
    placedItemTile: PlacedItemSchema
    supply: SupplySchema
}

export type UpdatePlacedItemTileAfterUseFertilizerResult = PlacedItemSchema

export interface PlantInfoLike {
    nextGrowthStageAfterHarvest: number
    growthStages: number
    randomness: RandomnessLike
}

export interface RandomnessLike {
    thief2: number
    thief3: number
}
