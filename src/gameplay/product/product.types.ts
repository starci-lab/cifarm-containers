import { AnimalInfoSchema, AnimalSchema, CropSchema, FruitSchema, PlacedItemSchema, TileInfoSchema } from "@src/databases"
import { FruitInfoSchema } from "@src/databases/mongoose/gameplay/schemas/fruit-info.schema"

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
    
}
export type UpdatePlacedItemTileAfterHarvestResult = PlacedItemSchema

export interface UpdatePlacedItemFruitAfterHarvestParams {
    placedItemFruit: PlacedItemSchema,
    fruit: FruitSchema
}

export type UpdatePlacedItemFruitAfterHarvestResult = PlacedItemSchema

export interface UpdatePlacedItemAnimalAfterHarvestParams {
    placedItemAnimal: PlacedItemSchema,
    animal: AnimalSchema
}

export type UpdatePlacedItemAnimalAfterHarvestResult = PlacedItemSchema

