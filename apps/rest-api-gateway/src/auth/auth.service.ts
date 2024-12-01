import { Observable } from "rxjs"
import {
    GenerateTestSignatureRequest,
    GenerateTestSignatureResponse,
    RequestMessageRequest,
    RequestMessageResponse,
    VerifySignatureRequest,
    VerifySignatureResponse
} from "@apps/gameplay-service"

export interface IAuthService {
    // Auth
    generateTestSignature(
        request: GenerateTestSignatureRequest
    ): Observable<GenerateTestSignatureResponse>
    verifySignature(request: VerifySignatureRequest): Observable<VerifySignatureResponse>
    requestMessage(request: RequestMessageRequest): Observable<RequestMessageResponse>
}
