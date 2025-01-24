import { InventoryEntity } from "@src/databases"
import { ArrayEntityWithUserIdParams, EntityParams } from "@src/common"
import { DeepPartial } from "typeorm"

export type AddParams = ArrayEntityWithUserIdParams<InventoryEntity>

export type AddResult = Array<DeepPartial<InventoryEntity>>

export interface RemoveParams extends EntityParams<InventoryEntity> {
    quantity: number
}
export type RemoveResult = DeepPartial<InventoryEntity>