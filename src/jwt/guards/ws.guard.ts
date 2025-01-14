import { Injectable, ExecutionContext } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class WsJwtAuthGuard extends AuthGuard("jwt") {
    getRequest(context: ExecutionContext) {
        return context.switchToWs().getClient()
    }
}
