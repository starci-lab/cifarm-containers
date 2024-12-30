import { Injectable, CanActivate, Logger, ExecutionContext } from "@nestjs/common"
import { JwtService } from "@src/jwt"
import { WsAuthTokenNotFoundException, WsUnauthorizedException } from "@src/exceptions"

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
    private readonly logger = new Logger(WsJwtAuthGuard.name)
    constructor(
        private readonly jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient()
        const token = client.handshake.auth.token
        if (!token) {
            this.logger.error("No auth token")
            throw new WsAuthTokenNotFoundException()
        }
        const user = await this.jwtService.verifyToken(token)
        if (!user) {
            this.logger.error("Unauthorized")
            throw new WsUnauthorizedException()
        }
        context.switchToWs().getClient().data.user = user
        return true
    }
}