import { AnimalInfoSchema, TileInfoSchema } from "@src/databases"
import { DeepPartial } from "@src/common"

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

export interface UpdateTileInfoAfterHarvestParams {
    tileInfo: TileInfoSchema
}
export type UpdateTileInfoAfterHarvestResult = DeepPartial<TileInfoSchema>
export interface UpdateAnimalInfoAfterCollectParams {
    animalInfo: AnimalInfoSchema
}
export type UpdateAnimalInfoAfterCollectResult = DeepPartial<AnimalInfoSchema>