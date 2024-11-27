import { authGrpcConstants, IAuthService, VerifySignatureResponse } from "@apps/auth-service"
import {
    CallHandler,
    ExecutionContext,
    Inject,
    Logger,
    NestInterceptor,
    OnModuleInit
} from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { lastValueFrom, mergeMap, Observable } from "rxjs"

export class AuthInterceptor<TRequest>
implements NestInterceptor<TRequest, VerifySignatureResponse>, OnModuleInit
{
    private readonly logger = new Logger(AuthInterceptor.name)

    constructor(@Inject(authGrpcConstants.NAME) private client: ClientGrpc) {}

    private authService: IAuthService
    onModuleInit() {
        this.authService = this.client.getService<IAuthService>(authGrpcConstants.SERVICE)
    }

    intercept(_: ExecutionContext, next: CallHandler): Observable<VerifySignatureResponse> {
        return next.handle().pipe(
            mergeMap(async (response: VerifySignatureResponse) => {
                // do something with after authenticated hook
                await lastValueFrom(
                    this.authService.afterAuthenticated({
                        userId: response.userId
                    })
                )
                return response
            })
        )
    }
}
