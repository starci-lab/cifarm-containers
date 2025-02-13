import { InventorySchema, InventoryTypeSchema } from "@src/databases"
import { DeepPartial } from "@src/common"
import { Connection } from "mongoose"

export interface AddParams {
    // inventories with the same type key
    inventories: Array<DeepPartial<InventorySchema>>
    // inventory type
    inventoryType: DeepPartial<InventoryTypeSchema>
    // quantity to add
    quantity: number
    // count
    count: number
    // max capacity
    capacity: number
}

export interface AddResult {
    updatedInventories: Array<DeepPartial<InventorySchema>>
    createdInventories: Array<DeepPartial<InventorySchema>>
}

export interface RemoveParams {
    // inventories with the same type key
    inventories: Array<DeepPartial<InventorySchema>>
    // quantity to remove
    quantity: number
}

export interface RemoveResult {
    updatedInventories: Array<DeepPartial<InventorySchema>>
    removedInventories: Array<DeepPartial<InventorySchema>>
}

export interface GetParamsParams {
    userId: string
    connection: Connection,
    inventoryType: InventoryTypeSchema,
}

export interface GetParamsResult {
    inventories: Array<InventorySchema>
    count: number
}
