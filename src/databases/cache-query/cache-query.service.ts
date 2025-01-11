import { Inject, Injectable } from "@nestjs/common"
import { Sha256Service } from "@src/crypto"
import { PostgreSQLDatabase } from "@src/env"
import { MODULE_OPTIONS_TOKEN } from "./cache-query.module-definition"
import { CacheQueryOptions } from "./cache-query.types"
import { IOREDIS, IoRedisClientOrCluster } from "@src/native"
import { PREFIX } from "./cache-query.constants"

@Injectable()
export class CacheQueryService {
    private readonly useHash: boolean
    private readonly database: PostgreSQLDatabase
    private readonly basePrefix: string

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: CacheQueryOptions,
        @Inject(IOREDIS)
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

    public async getCacheKeys(): Promise<Array<string>> {
        return await this.ioRedisClientOrCluster.keys(`${this.basePrefix}*`)
    }
}

interface GenerateCacheKeyParams {
    entityName: string
    options: unknown
}
