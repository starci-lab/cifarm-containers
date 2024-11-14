import { BroadcastPlacedItemsRequest, BroadcastPlacedItemsResponse } from "@apps/broadcast-service"
import { Observable } from "rxjs"

export interface IPlacedItemsService {
    broadcastPlacedItems(
        request: BroadcastPlacedItemsRequest
    ): Observable<BroadcastPlacedItemsResponse>
}
