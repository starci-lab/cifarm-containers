import { Inject, Injectable } from "@nestjs/common"
import { Sha256Service } from "@src/crypto"
import { MODULE_OPTIONS_TOKEN } from "./cache-key.module-definition"
import { CacheIdentifier, PostgreSQLCacheKeyOptions, PostgreSQLCacheKeyType } from "./cache-key.types"
import { ClassLike } from "@src/common"
import { PostgreSQLDatabase } from "@src/env"

@Injectable()
export class PostgreSQLCacheKeyService {
    private readonly hashPagination: boolean
    private readonly database: PostgreSQLDatabase
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: PostgreSQLCacheKeyOptions,
        private readonly sha256Service: Sha256Service
    ) {
        // Hash is enabled by default
        this.hashPagination = this.options.hashPagination || true
        this.database = this.options.database || PostgreSQLDatabase.Gameplay
    }

    public generateCacheKey <TEntity extends ClassLike>({
        entity,
        identifier,
    }: GenerateCacheKeyParams<TEntity>) {
        const prefix = `postgresql:${this.database}:${entity.name}`
        //switch-case for type ensuring
        switch (identifier.type) {
        case PostgreSQLCacheKeyType.Id:
            return `${prefix}:${identifier.type}:${identifier.id}`
        case PostgreSQLCacheKeyType.Pagination: {
            let postfix = JSON.stringify(identifier.options)
            // Hash the postfix if enabled
            if (this.hashPagination) {
                postfix = this.sha256Service.hash(postfix)
            }
            return `${prefix}:${identifier.type}:${postfix}`
        }
        }
    }
}

export interface GenerateCacheKeyParams<TEntity extends ClassLike> {
    entity: TEntity
    identifier: CacheIdentifier
}
