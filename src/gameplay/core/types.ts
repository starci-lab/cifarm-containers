import {
    AnimalInfo,
    AnimalSchema,
    CropInfo,
    CropSchema,
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
