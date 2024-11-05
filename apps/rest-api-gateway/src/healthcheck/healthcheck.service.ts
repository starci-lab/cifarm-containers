import { DoHealthcheckResponse } from "@apps/healthcheck-service"
import { Empty } from "@src/types"
import { Observable } from "rxjs"

export interface IHealthcheckService {
  doHealthcheck(request: Empty): Observable<DoHealthcheckResponse>;
}
