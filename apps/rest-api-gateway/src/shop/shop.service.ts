import { BuyAnimalRequest, BuyAnimalResponse } from "@apps/shop-service/src/buy-animal"
import { Observable } from "rxjs"

export interface IShopService {
  buyAnimal(
    request: BuyAnimalRequest,
  ): Observable<BuyAnimalResponse>;
}
