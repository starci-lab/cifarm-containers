import { Injectable, Logger } from "@nestjs/common"
import { RequestMessageResponse } from "./request-message.dto"
import { Cache } from "cache-manager"
import { v4 } from "uuid"
import { CacheRedisService } from "@src/databases"

@Injectable()
export class RequestMessageService {
    private readonly logger = new Logger(RequestMessageService.name)

    private readonly cacheManager: Cache
    constructor(
        private readonly cacheRedisService: CacheRedisService
    ) {
        this.cacheManager = this.cacheRedisService.getCacheManager()
    }

    public async requestMessage(): Promise<RequestMessageResponse> {
        const message = v4()
        await this.cacheManager.set(message, true, 60 * 1000)
        return {
            message
        }
    }
}
