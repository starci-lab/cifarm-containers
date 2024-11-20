import { BuyAnimalRequest, BuyAnimalResponse } from "@apps/shop-service/src/buy-animals"
import { Observable } from "rxjs"
import { BuySeedsRequest, BuySeedsResponse } from "@apps/shop-service/src/buy-seeds"
import { BuySuppliesRequest, BuySuppliesResponse } from "@apps/shop-service/src/buy-supplies"

export interface IGameplayService {
    buySeeds(request: BuySeedsRequest): Observable<BuySeedsResponse>
    buySupplies(request: BuySuppliesRequest): Observable<BuySuppliesResponse>
    buyAnimal(request: BuyAnimalRequest): Observable<BuyAnimalResponse>
}
