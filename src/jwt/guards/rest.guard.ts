import { Injectable, ExecutionContext } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class RestJwtAuthGuard extends AuthGuard("jwt") {
    getRequest(context: ExecutionContext) {
        return context.switchToHttp().getRequest()
    }
}
