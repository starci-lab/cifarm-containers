import { EntityParams } from "@src/common"
import { AnimalInfo, TileInfo } from "@src/databases"
import { DeepPartial } from "@src/common"

export interface ComputeAnimalQualityChanceParams extends EntityParams<AnimalInfo> {
    qualityProductChanceLimit: number
    qualityProductChanceStack: number
}

export interface ComputeTileQualityChanceParams extends EntityParams<TileInfo> {
    qualityProductChanceLimit: number
    qualityProductChanceStack: number
}

export type UpdateTileInfoAfterHarvestParams = EntityParams<TileInfo>
export type UpdateTileInfoAfterHarvestResult = DeepPartial<TileInfo>
export type UpdateAnimalInfoAfterCollectParams = EntityParams<AnimalInfo>
export type UpdateAnimalInfoAfterCollectResult = DeepPartial<AnimalInfo>