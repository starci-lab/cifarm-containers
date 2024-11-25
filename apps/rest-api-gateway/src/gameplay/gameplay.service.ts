import { BuySeedsRequest, BuySeedsResponse } from "@apps/gameplay-service"
import { Observable } from "rxjs"
export interface IGameplayService {
    buySeeds(request: BuySeedsRequest): Observable<BuySeedsResponse>
}
