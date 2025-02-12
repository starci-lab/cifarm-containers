import { AnimalInfo, TileInfo } from "@src/databases"
import { DeepPartial } from "@src/common"

export interface ComputeAnimalQualityChanceParams {
    animalInfo: AnimalInfo
    qualityProductChanceLimit: number
    qualityProductChanceStack: number
}

export interface ComputeTileQualityChanceParams {
    tileInfo: TileInfo
    qualityProductChanceLimit: number
    qualityProductChanceStack: number
}

export interface UpdateTileInfoAfterHarvestParams {
    tileInfo: TileInfo
}
export type UpdateTileInfoAfterHarvestResult = DeepPartial<TileInfo>
export interface UpdateAnimalInfoAfterCollectParams {
    animalInfo: AnimalInfo
}
export type UpdateAnimalInfoAfterCollectResult = DeepPartial<AnimalInfo>