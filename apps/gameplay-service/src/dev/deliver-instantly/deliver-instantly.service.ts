import { Injectable, Logger } from "@nestjs/common"
import { CacheKey, InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { DeliverInstantlyResponse } from "./deliver-instantly.dto"

@Injectable()
export class DeliverInstantlyService {
    private readonly logger = new Logger(DeliverInstantlyService.name)
    
    constructor(
        @InjectCache()
        private readonly cacheManager: Cache
    ) {
    }

    async deliverInstantly(): Promise<DeliverInstantlyResponse> {
        await this.cacheManager.set(CacheKey.DeliverInstantly, true, 60 * 1000)
        return {}
    }
}
