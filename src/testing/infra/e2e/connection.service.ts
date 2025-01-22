import { Inject, Injectable, Logger } from "@nestjs/common"
import { CACHE_MANAGER } from "@src/cache"
import { Cache } from "cache-manager"

@Injectable()
export class E2EConnectionService {
    private readonly logger = new Logger(E2EConnectionService.name)
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}

    public async closeAll(): Promise<void> {
        const promises: Array<Promise<void>> = []
        promises.push((async () => {
            await this.cacheManager.disconnect()
        })())
        await Promise.all(promises)
    }
}
