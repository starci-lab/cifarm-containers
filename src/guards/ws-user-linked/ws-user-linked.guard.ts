import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager"
import { Injectable, CanActivate, Logger, ExecutionContext, Inject } from "@nestjs/common"

@Injectable()
export class WsUserLinkedGuard implements CanActivate {
    private readonly logger = new Logger(WsUserLinkedGuard.name)
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient()
        const clientId = client.id
        this.logger.debug(`Client connected: ${clientId}`)
        //find the user id from the cache
        const userId = await this.cacheManager.get(clientId) as string
        if (!userId) {
            this.logger.error("User unlinked with client")
            return false
        }
        return true
    }
}