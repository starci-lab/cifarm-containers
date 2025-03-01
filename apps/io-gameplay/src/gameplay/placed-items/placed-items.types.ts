import { PlacedItemSchema } from "@src/databases"

export interface PlacedItemsSyncedMessage {
    //placed items
    placedItems: Array<PlacedItemSchema>
    //current user id, beneficial for debugging
    userId: string
    isSecondarySync?: boolean
}

export interface SyncPlacedItemsPayload {
    //user id
    userId: string
}

export interface GetPlacedItemsParams {
    //user id
    userId: string
}

export interface SyncPlacedItemsPayload {
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
