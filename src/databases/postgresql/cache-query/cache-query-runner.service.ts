import { EntityTarget, FindManyOptions, FindOneOptions, QueryRunner } from "typeorm"
import { ClassLike } from "@src/common"
import { Injectable } from "@nestjs/common"
import { PostgreSQLCacheQueryService } from "./cache-query.service"

@Injectable()
export class PostgreSQLCacheQueryRunnerService {
    constructor(
            private readonly cacheQueryService: PostgreSQLCacheQueryService
    ) { }

    public async findOne<ObjectLiteral>(
        queryRunner: QueryRunner,
        entityClass: EntityTarget<ObjectLiteral>,
        options: FindOneOptions<ObjectLiteral>
    ) {
        return await queryRunner.manager.findOne(entityClass, {
            ...options,
            cache: {
                id: this.cacheQueryService.generateCacheKey({
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
                id: this.cacheQueryService.generateCacheKey({
                    entityName: (entityClass as ClassLike).name,
                    options
                }),
                milliseconds: 0
            }
        })
    }
}