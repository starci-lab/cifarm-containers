import { Observable } from "rxjs"
import {
    GenerateTestSignatureRequest,
    GenerateTestSignatureResponse,
    RequestMessageRequest,
    RequestMessageResponse,
    VerifySignatureRequest,
    VerifySignatureResponse
} from "./auth"
import { AfterAuthenticatedRequest, AfterAuthenticatedResponse } from "./hooks"

export interface IAuthService {
    // Auth
    generateTestSignature(
        request: GenerateTestSignatureRequest
    ): Observable<GenerateTestSignatureResponse>
    verifySignature(request: VerifySignatureRequest): Observable<VerifySignatureResponse>
    requestMessage(request: RequestMessageRequest): Observable<RequestMessageResponse>

    // Hooks
    afterAuthenticated(request: AfterAuthenticatedRequest): Observable<AfterAuthenticatedResponse>
}
