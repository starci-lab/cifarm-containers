import { PlacedItemEntity } from "@src/databases"

export interface PlacedItemsMessage {
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