import { DoHealthcheckResponse } from "@apps/healthcheck-service"
import { BuyAnimalRequest, BuyAnimalResponse } from "@apps/shop-service/src/buy-animal";
import { Empty } from "@src/types"
import { Observable } from "rxjs"

export interface IGameplayService {
  buySeeds(request: Empty): Observable<DoHealthcheckResponse>;
  buyAnimal(request: BuyAnimalRequest) : Observable<BuyAnimalResponse>;
}
