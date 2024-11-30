import { Inject, Injectable, Logger } from "@nestjs/common"
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager"
import { SpeedUpRequest, SpeedUpResponse } from "./speed-up.dto"
import { speedUpConstants } from "../../config"

@Injectable()
export class SpeedUpService {
    private readonly logger = new Logger(SpeedUpService.name)

    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}

    async speedUp(request: SpeedUpRequest): Promise<SpeedUpResponse> {
        this.logger.debug(`Speeding up growth time with time ${request.time}`)
        await this.cacheManager.set(speedUpConstants.key, request.time)
        return {}
    }
}
