import {
    GenerateTestSignatureRequest,
    GenerateTestSignatureResponse,
    RequestMessageResponse,
    VerifySignatureRequest,
    VerifySignatureResponse,
} from "@apps/auth-service"
import { Empty } from "@src/types"
import { Observable } from "rxjs"

export interface IAuthService {
  requestMessage(request: Empty): Observable<RequestMessageResponse>;
  generateTestSignature(
    request: GenerateTestSignatureRequest,
  ): Observable<GenerateTestSignatureResponse>;
  verifySignature(
    request: VerifySignatureRequest,
  ): Observable<VerifySignatureResponse>;
}
