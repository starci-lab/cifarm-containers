import { InventorySchema, PlacedItemSchema, UserSchema } from "@src/databases"

export interface GetCreatedSyncedInventoriesParams {
    inventories: Array<InventorySchema>
}

export interface GetDeletedSyncedInventoriesParams {
    inventoryIds: Array<string>
}

export interface GetCreatedSyncedPlacedItemsParams {
    placedItems: Array<PlacedItemSchema>
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

