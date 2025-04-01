export interface SyncPlacedItemsPayload {
    data: Array<WithStatus<PlacedItemSchema>>
    userId: string
}

export interface GetVisitingUserIdsParams {
    userId: string
}

export interface GetPlacedItemsParams {
    userId: string
}

import { WithStatus } from "@src/common"
import { PlacedItemSchema } from "@src/databases"

export interface PlacedItemsSyncedMessage {
    //placed items
    data: Array<WithStatus<PlacedItemSchema>>
    //current user id, beneficial for debugging
}


export interface RequestDisplayTimersMessage { 
    ids: Array<string>
}