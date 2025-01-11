import { EntityTarget, FindManyOptions, FindOneOptions, QueryRunner } from "typeorm"
import { ClassLike } from "@src/common"
import { Inject, Injectable } from "@nestjs/common"
import { Sha256Service } from "@src/crypto"
import { PostgreSQLDatabase } from "@src/env"
import { MODULE_OPTIONS_TOKEN } from "./cache-query-runner.module-definition"
import { PostgreSQLCacheQueryRunnerOptions } from "./cache-query-runner.types"

@Injectable()
export class PostgreSQLCacheQueryRunnerService {
    private readonly useHash: boolean
    private readonly database: PostgreSQLDatabase
    constructor(
            @Inject(MODULE_OPTIONS_TOKEN)
            private readonly options: PostgreSQLCacheQueryRunnerOptions,
            private readonly sha256Service: Sha256Service
    ) {
        // Hash is enabled by default
        this.useHash = this.options.useHash || true
        this.database = this.options.database || PostgreSQLDatabase.Gameplay
    }

    private generateCacheKey({
        entityName,
        options
    }: GenerateCacheKeyParams): string {
        const prefix = `postgresql:${this.database}:${entityName}`
        //switch-case for type ensuring
        let postfix = JSON.stringify(options)
        if (this.useHash) {
            postfix = this.sha256Service.hash(postfix)
        }
        return `${prefix}:${postfix}`
    }

    public async findOne<ObjectLiteral>(
        queryRunner: QueryRunner,
        entityClass: EntityTarget<ObjectLiteral>,
        options: FindOneOptions<ObjectLiteral>
    ) {
        return await queryRunner.manager.findOne(entityClass, {
            ...options,
            cache: {
                id: this.generateCacheKey({
                    entityName: (entityClass as ClassLike).name,
                    options
                }),
                milliseconds: 0
            }
        })
    }

    public async find<ObjectLiteral>(
        queryRunner: QueryRunner,
        entityClass: EntityTarget<ObjectLiteral>,
        options: FindManyOptions<ObjectLiteral>
    ) {
        return await queryRunner.manager.find(entityClass, {
            ...options,
            cache: {
                id: this.generateCacheKey({
                    entityName: (entityClass as ClassLike).name,
                    options
                }),
                milliseconds: 0
            }
        })
    }
}

interface GenerateCacheKeyParams {
    entityName: string
    options: unknown
}