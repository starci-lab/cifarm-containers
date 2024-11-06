import {
    BroadcastPlacedItemsRequest,
    BroadcastPlacedItemsResponse,
} from "@apps/websocket-broadcast-service"
import { Observable } from "rxjs"

export interface IPlacedItemsService {
  broadcastPlacedItems(
    request: BroadcastPlacedItemsRequest,
  ): Observable<BroadcastPlacedItemsResponse>;
}
