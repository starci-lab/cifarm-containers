import { Inject, Injectable, Logger } from "@nestjs/common"
import { Sha256Service } from "@src/crypto"
import { PostgreSQLDatabase } from "@src/env"
import { MODULE_OPTIONS_TOKEN } from "./cache-query.module-definition"
import { CacheQueryOptions } from "./cache-query.types"
import { InjectIoRedis, IoRedisClientOrCluster } from "@src/native"
import { PREFIX } from "./cache-query.constants"

@Injectable()
export class CacheQueryService {
    private readonly useHash: boolean
    private readonly database: PostgreSQLDatabase
    private readonly basePrefix: string

    private readonly logger = new Logger(CacheQueryService.name)

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: CacheQueryOptions,
        @InjectIoRedis()
        private readonly ioRedisClientOrCluster: IoRedisClientOrCluster,
        private readonly sha256Service: Sha256Service
    ) {
        // Hash is enabled by default
        this.useHash = this.options.useHash || true
        this.database = this.options.database || PostgreSQLDatabase.Gameplay
        this.basePrefix = `${PREFIX}:${this.database}`
    }

    public generateCacheKey({ entityName, options }: GenerateCacheKeyParams): string {
        const prefix = `${this.basePrefix}:${entityName}`
        // convert options to string
        let postfix = JSON.stringify(options)
        if (this.useHash) {
            postfix = this.sha256Service.hash(postfix)
        }
        return `${prefix}:${postfix}`
    }

    public async clear(): Promise<void> {
        const keys = await this.ioRedisClientOrCluster.keys(`${this.basePrefix}*`)
        this.logger.debug(`Clearing ${keys.length} cache keys`)
        const promise: Array<Promise<number>> = []
        for (const key of keys) {
            promise.push(this.ioRedisClientOrCluster.del(key))
        }
        await Promise.all(promise)
    }

    // method to get the native Redis client
    public getNativeRedis(): IoRedisClientOrCluster {
        return this.ioRedisClientOrCluster
    }
}

interface GenerateCacheKeyParams {
    entityName: string
    options: unknown
}
