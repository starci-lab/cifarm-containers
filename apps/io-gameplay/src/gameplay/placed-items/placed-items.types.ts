import { PlacedItemSchema } from "@src/databases"

export interface PlacedItemsSyncedMessage {
    //placed items
    placedItems: Array<PlacedItemSchema>
    //current user id, beneficial for debugging
    userId: string
    // response
    // response: {
    //     userId: string
    //     placedItemId: string
    //     action: "Water"
    //     status: "Success" | "Failed"
    //     data: {
    //         quantity:
    //     }
    // }
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
