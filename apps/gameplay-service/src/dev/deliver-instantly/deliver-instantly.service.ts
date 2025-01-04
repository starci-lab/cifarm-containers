import { Cache } from "@nestjs/cache-manager"
import { Injectable, Logger } from "@nestjs/common"
import { CacheKey, CacheRedisService } from "@src/cache"
import { DeliverInstantlyResponse } from "./deliver-instantly.dto"

@Injectable()
export class DeliverInstantlyService {
    private readonly logger = new Logger(DeliverInstantlyService.name)

    private readonly cacheManager: Cache
    constructor(
        private readonly cacheRedisService: CacheRedisService
    ) {
        this.cacheManager = this.cacheRedisService.getCacheManager()
    }

    async deliverInstantly(): Promise<DeliverInstantlyResponse> {
        await this.cacheManager.set(CacheKey.DeliverInstantly, true, 60 * 1000)
        return {}
    }
}
