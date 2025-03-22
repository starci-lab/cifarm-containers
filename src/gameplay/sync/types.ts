import { InventorySchema, PlacedItemSchema } from "@src/databases"
import { SchemaStatus } from "@src/common"

export interface GetCreatedOrUpdatedSyncedInventoriesParams {
    inventories: Array<InventorySchema>
    status?: SchemaStatus.Created | SchemaStatus.Updated
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

