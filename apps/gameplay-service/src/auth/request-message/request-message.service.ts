import { Injectable, Logger } from "@nestjs/common"
import { InjectCache } from "@src/cache"
import { v4 } from "uuid"
import { RequestMessageResponse } from "./request-message.dto"
import { Cache } from "cache-manager"

@Injectable()
export class RequestMessageService {
    private readonly logger = new Logger(RequestMessageService.name)

    constructor(
        @InjectCache()
        private readonly cacheManager: Cache
    ) { }

    public async requestMessage(): Promise<RequestMessageResponse> {
        const message = v4()
        await this.cacheManager.set(message, true, 60 * 1000)
        return {
            message
        }
    }
}
