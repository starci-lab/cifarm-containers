import { PlacedItemEntity } from "@src/databases"

export interface PlacedItemsSyncedMessage {
    //placed items
    placedItems: Array<PlacedItemEntity>
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
