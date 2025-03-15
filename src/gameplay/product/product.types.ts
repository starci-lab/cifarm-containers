import { AnimalInfoSchema, FruitSchema, TileInfoSchema } from "@src/databases"
import { DeepPartial } from "@src/common"
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

export interface UpdateTileInfoAfterHarvestParams {
    tileInfo: TileInfoSchema
}
export type UpdateTileInfoAfterHarvestResult = DeepPartial<TileInfoSchema>
export interface UpdateAnimalInfoAfterCollectParams {
    animalInfo: AnimalInfoSchema
}
export type UpdateAnimalInfoAfterCollectResult = DeepPartial<AnimalInfoSchema>

export interface UpdateFruitInfoAfterHarvestParams {
    fruitInfo: FruitInfoSchema,
    fruit: FruitSchema
}

export type UpdateFruitInfoAfterHarvestResult = DeepPartial<FruitInfoSchema>