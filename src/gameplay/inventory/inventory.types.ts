import { InventorySchema, InventoryTypeSchema } from "@src/databases"
import { DeepPartial } from "@src/common"
import { ClientSession, Connection } from "mongoose"

export interface AddParams {
    // inventories with the same type key
    inventories: Array<DeepPartial<InventorySchema>>
    // inventory type
    inventoryType: DeepPartial<InventoryTypeSchema>
    // quantity to add
    quantity: number
    // user id
    userId: string
    // max capacity
    capacity: number
    // in toolbar or not
    inToolbar: boolean
    // occupied indexes
    occupiedIndexes: Array<number>
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
    session: ClientSession,
    inventoryType: InventoryTypeSchema,
}

export interface GetParamsResult {
    inventories: Array<InventorySchema>
    // occupied indexes
    occupiedIndexes: Array<number>
}
