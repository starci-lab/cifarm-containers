import { Observable } from "rxjs"
import {
    CreatePlacedItemRequest,
    CreatePlacedItemResponse,
    DeletePlacedItemRequest,
    DeletePlacedItemResponse,
    GetPlacedItemRequest,
    GetPlacedItemsRequest,
    GetPlacedItemsResponse,
    UpdatePlacedItemRequest,
    UpdatePlacedItemResponse
} from "./placed-item"

export interface IPlacedItemService {
    GetPlacedItem(request: GetPlacedItemRequest): Observable<GetPlacedItemsResponse>
    GetPlacedItems(request: GetPlacedItemsRequest): Observable<GetPlacedItemsResponse>
    CreatePlacedItem(request: CreatePlacedItemRequest): Observable<CreatePlacedItemResponse>
    UpdatePlacedItem(request: UpdatePlacedItemRequest): Observable<UpdatePlacedItemResponse>
    DeletePlacedItem(request: DeletePlacedItemRequest): Observable<DeletePlacedItemResponse>
}
