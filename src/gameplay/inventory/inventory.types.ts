import { InventorySchema } from "@src/databases"
import { ArrayEntityWithUserIdParams, EntityParams } from "@src/common"
import { DeepPartial } from "@src/common"

export type AddParams = ArrayEntityWithUserIdParams<InventorySchema>

export type AddResult = Array<DeepPartial<InventorySchema>>

export interface RemoveParams extends EntityParams<InventorySchema> {
    quantity: number
}
export type RemoveResult = DeepPartial<InventorySchema>