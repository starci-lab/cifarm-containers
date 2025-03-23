import { InventorySchema, PlacedItemSchema, UserSchema } from "@src/databases"
import { SchemaStatus } from "@src/common"

export interface GetCreatedSyncedInventoriesParams {
    inventories: Array<InventorySchema>
}

export interface GetDeletedSyncedInventoriesParams {
    inventoryIds: Array<string>
}

export interface GetCreatedOrUpdatedSyncedPlacedItemsParams {
    placedItems: Array<PlacedItemSchema>
    status?: SchemaStatus.Created | SchemaStatus.Updated
}

export interface GetDeletedSyncedPlacedItemsParams {
    placedItemIds: Array<string>
}

export interface GetPartialUpdatedSyncedInventoryParams {
    inventorySnapshot: InventorySchema
    inventoryUpdated: InventorySchema
}

export interface GetPartialUpdatedSyncedUserParams {
    userSnapshot: UserSchema
    userUpdated: UserSchema
}

