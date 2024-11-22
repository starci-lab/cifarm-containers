import { Observable } from "rxjs"
import {
    AddInventoryRequest,
    AddInventoryResponse,
    GetInventoryRequest,
    GetInventoryResponse
} from "./inventory"

export interface IInventoryService {
    GetInventory(request: GetInventoryRequest): Observable<GetInventoryResponse>
    AddInventory(request: AddInventoryRequest): Observable<AddInventoryResponse>
}
