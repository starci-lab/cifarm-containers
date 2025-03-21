import { PlacedItemSchema } from "@src/databases"
import { SchemaStatus } from "@src/common"

export interface GetCreatedOrUpdatedSyncedPlacedItemsParams {
    placedItems: Array<PlacedItemSchema>
    status?: SchemaStatus.Created | SchemaStatus.Updated
}

export interface GetDeletedSyncedPlacedItemsParams {
    placedItemIds: Array<string>
}

