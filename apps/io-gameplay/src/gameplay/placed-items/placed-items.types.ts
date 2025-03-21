import { DeepPartial } from "@src/common"
import { PlacedItemSchema } from "@src/databases"

export interface PlacedItemsSyncedMessage {
    //placed items
    placedItems: Array<DeepPartial<PlacedItemSchema>>
    //current user id, beneficial for debugging
}

export interface SyncPlacedItemsPayload {
    //user id
    userId: string
    // response
}

export interface GetPlacedItemsParams {
    //user id
    userId: string
}

export interface SyncPlacedItemsParams {
    userId: string
}

export interface GetVisitingUserIdsParams {
    userId: string
}

export interface GetPlacedItemsParams {
    userId: string
}
