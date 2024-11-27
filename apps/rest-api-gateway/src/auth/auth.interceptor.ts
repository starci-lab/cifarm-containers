import { CallHandler, ExecutionContext, Logger, NestInterceptor } from "@nestjs/common"
import { Observable } from "rxjs"

export class AuthInterceptor<TRequest, TResponse> implements NestInterceptor<TRequest, TResponse> {
    private readonly logger = new Logger(AuthInterceptor.name)
    intercept(context: ExecutionContext, next: CallHandler): Observable<TResponse> {
        return next
            .handle()
    }
} 