import { Observable } from "rxjs"
import { BuySeedsRequest, BuySeedsResponse } from "@apps/gameplay-service/src/buy-seeds"
import { BuySuppliesRequest, BuySuppliesResponse } from "@apps/gameplay-service/src/buy-supplies"
import {
    ConstructBuildingRequest,
    ConstructBuildingResponse
} from "@apps/gameplay-service/src/construct-building"
import { BuyAnimalsRequest, BuyAnimalsResponse } from "@apps/gameplay-service/src/buy-animals"

export interface IGameplayService {
    buySeeds(request: BuySeedsRequest): Observable<BuySeedsResponse>
    buySupplies(request: BuySuppliesRequest): Observable<BuySuppliesResponse>
    buyAnimal(request: BuyAnimalsRequest): Observable<BuyAnimalsResponse>
    constructBuilding(request: ConstructBuildingRequest): Observable<ConstructBuildingResponse>
}
