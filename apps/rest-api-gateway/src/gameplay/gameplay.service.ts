import { BuyAnimalRequest, BuyAnimalResponse } from "@apps/shop-service/src/buy-animal"
import { Observable } from "rxjs"
import { BuySeedsRequest, BuySeedsResponse } from "@apps/shop-service/src/buy-seeds"

export interface IGameplayService {
  buySeeds(request: BuySeedsRequest): Observable<BuySeedsResponse>
  buyAnimal(request: BuyAnimalRequest) : Observable<BuyAnimalResponse>
}
