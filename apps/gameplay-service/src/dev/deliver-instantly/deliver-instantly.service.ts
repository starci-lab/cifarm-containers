import { Inject, Injectable, Logger } from "@nestjs/common"
import { DeliverInstantlyResponse } from "./deliver-instantly.dto"
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager"
import { CacheKey } from "@src/config"

@Injectable()
export class DeliverInstantlyService {
    private readonly logger = new Logger(DeliverInstantlyService.name)

    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    async deliverInstantly(): Promise<DeliverInstantlyResponse> {
        await this.cacheManager.set(CacheKey.DeliverInstantly, true, 60 * 1000)
        return {}
    }
}
