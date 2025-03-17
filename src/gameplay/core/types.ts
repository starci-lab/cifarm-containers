import {
    AnimalInfo,
    AnimalInfoSchema,
    AnimalSchema,
    CropInfo,
    CropSchema,
    FruitInfo,
    FruitInfoSchema,
    FruitSchema,
    PlacedItemSchema,
    SupplySchema,
    TileInfoSchema
} from "@src/databases"

export interface ComputeAnimalQualityChanceParams {
    animalInfo: AnimalInfoSchema
    qualityProductChanceLimit: number
    qualityProductChanceStack: number
}

export interface ComputeTileQualityChanceParams {
    tileInfo: TileInfoSchema
    qualityProductChanceLimit: number
    qualityProductChanceStack: number
}

export interface ComputeFruitQualityChanceParams {
    fruitInfo: FruitInfoSchema
    qualityProductChanceLimit: number
    qualityProductChanceStack: number
}

export interface UpdatePlacedItemTileAfterHarvestParams {
    placedItemTile: PlacedItemSchema
    crop: CropSchema
    cropInfo: CropInfo
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
