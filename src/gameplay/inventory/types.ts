import { InventoryKind, InventorySchema, InventoryTypeSchema } from "@src/databases"
import { DeepPartial } from "@src/common"
import { ClientSession, Connection } from "mongoose"

export interface AddParams {
    // inventories with the same type key and same kind
    inventories: Array<InventorySchema>
    // inventory type
    inventoryType: DeepPartial<InventoryTypeSchema>
    // quantity to add
    quantity?: number
    // user id
    userId: string
    // max capacity
    capacity: number
    // occupied indexes
    occupiedIndexes: Array<number>
    kind?: InventoryKind
}

export interface InventoryUpdate {
    inventorySnapshot: InventorySchema;
    inventoryUpdated: InventorySchema;
}

export interface AddResult {
    updatedInventories: Array<InventoryUpdate>
    createdInventories: Array<DeepPartial<InventorySchema>>
}

export interface RemoveParams {
    // inventories with the same type key
    inventories: Array<InventorySchema>
    // quantity to remove
    quantity: number
}

export interface GetAddParamsParams {
    userId: string
    connection: Connection,
    session: ClientSession,
    inventoryType: InventoryTypeSchema,
    kind?: InventoryKind
}

export interface GetAddParamsResult {
    inventories: Array<InventorySchema>
    // occupied indexes
    occupiedIndexes: Array<number>
}

export interface GetUnoccupiedIndexesParams {
    userId: string
    connection: Connection,
    session: ClientSession,
    inventoryType: InventoryTypeSchema
    kind?: InventoryKind
    storageCapacity: number
}

export interface GetRemoveParamsResult {
    inventories: Array<InventorySchema>
}

export interface RemoveSingleParams {
    inventory: InventorySchema
    quantity: number
}

// we return both object to allow implementation, check if removed or updated
export interface RemoveSingleResult {
    updatedInventory?: InventoryUpdate
    removedInventory?: InventorySchema
    removeInsteadOfUpdate?: boolean
}
