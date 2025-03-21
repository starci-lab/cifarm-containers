import { InventoryKind, InventorySchema, InventoryTypeSchema } from "@src/databases"
import { DeepPartial, SchemaStatus } from "@src/common"
import { ClientSession, Connection } from "mongoose"

export interface AddParams {
    // inventories with the same type key and same kind
    inventories: Array<InventorySchema>
    // inventory type
    inventoryType: DeepPartial<InventoryTypeSchema>
    // quantity to add
    quantity: number
    // user id
    userId: string
    // max capacity
    capacity: number
    // occupied indexes
    occupiedIndexes: Array<number>
    kind?: InventoryKind
}

export interface AddResult {
    updatedInventories: Array<InventorySchema>
    createdInventories: Array<DeepPartial<InventorySchema>>
}

export interface RemoveParams {
    // inventories with the same type key
    inventories: Array<InventorySchema>
    // quantity to remove
    quantity: number
}

export interface RemoveResult {
    updatedInventories: Array<InventorySchema>
    removedInventories: Array<InventorySchema>

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


export interface GetRemoveParamsParams {
    userId: string
    connection: Connection,
    session: ClientSession,
    inventoryType: InventoryTypeSchema
    kind?: InventoryKind
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

export interface GetCreatedOrUpdatedSyncedInventoriesParams {
    inventories: Array<InventorySchema>
    status?: SchemaStatus.Created | SchemaStatus.Updated
}

export interface GetDeletedSyncedInventoriesParams {
    inventoryIds: Array<string>
}

