import { PlacedItemSchema } from "@src/databases"

export enum SyncMode {
    // Sync every second
    Interval = "interval",
    // Sync when triggered
    OnDemand = "on-demand",
    // Sync instantly
    Immediate = "immediate"
}

export interface PlacedItemsSyncedMessage {
    //placed items
    placedItems: Array<PlacedItemSchema>
    //current user id, beneficial for debugging
    userId: string
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
