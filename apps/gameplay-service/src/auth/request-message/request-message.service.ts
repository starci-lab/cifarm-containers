import { Inject, Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { RequestMessageResponse } from "./request-message.dto"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"
import { v4 } from "uuid"

@Injectable()
export class RequestMessageService {
    private readonly logger = new Logger(RequestMessageService.name)

    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    public async requestMessage(): Promise<RequestMessageResponse> {
        this.logger.debug("RequestMessage called")
        const message = v4()
        await this.cacheManager.set(message, true, 60 * 1000)
        return {
            message
        }
    }
}
