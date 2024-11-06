import { CanActivate, ExecutionContext, Logger } from "@nestjs/common"
import { Observable } from "rxjs"

export class DebugGuard implements CanActivate {
    private readonly logger = new Logger(DebugGuard.name)
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest()
        this.logger.debug(request.body)
        return true
    }
}
