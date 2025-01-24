import { AnimalInfoEntity, TileInfoEntity } from "@src/databases"
import { EntityParams } from "@src/common"
import { DeepPartial } from "typeorm"

export interface ComputeAnimalQualityChanceParams extends EntityParams<AnimalInfoEntity> {
    qualityProductChanceLimit: number
    qualityProductChanceStack: number
}

export interface ComputeTileQualityChanceParams extends EntityParams<TileInfoEntity> {
    qualityProductChanceLimit: number
    qualityProductChanceStack: number
}

export type UpdateTileInfoAfterHarvestParams = EntityParams<TileInfoEntity>
export type UpdateTileInfoAfterHarvestResult = DeepPartial<TileInfoEntity>
export type UpdateAnimalInfoAfterCollectParams = EntityParams<AnimalInfoEntity>
export type UpdateAnimalInfoAfterCollectResult = DeepPartial<AnimalInfoEntity>