import { DoHealthcheckResponse } from "@apps/healthcheck-service"
import { Empty } from "@src/types"
import { Observable } from "rxjs"

export interface IGameplayService {
  buySeeds(request: Empty): Observable<DoHealthcheckResponse>;
}
