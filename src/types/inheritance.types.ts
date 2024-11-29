import { Field, InputType, Int } from "@nestjs/graphql"
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"
import { DeepPartial, QueryRunner } from "typeorm"

export class UserIdRequest {
    @IsUUID("4")
    @ApiHideProperty()
        userId: string
}

export class EntityParams<TEntity> {
    entity: DeepPartial<TEntity>
}

export class EntityWithUserIdParams<TEntity> extends UserIdRequest {
    entity: DeepPartial<TEntity>
}

export class ArrayEntityParams<TEntity> {
    entities: Array<DeepPartial<TEntity>>
}

export class ArrayEntityWithUserIdParams<TEntity> extends UserIdRequest {
    entities: Array<DeepPartial<TEntity>>
    data: DeepPartial<TEntity>
}

export class CreatedResponse {
    @IsUUID("4")
    @ApiProperty({ example: "5a6919c3-6ae3-45de-81eb-f1bbb05a246d" })
        id: string
}

export class ArrayResponse<TEntity> {
    @ApiProperty({ type: [Object] })
        items: Array<TEntity>
}

export class CreateRequest<TEntity> {
    @ApiProperty({ type: Object })
        item: DeepPartial<TEntity>
}

export class CreateWithUserIdRequest<TEntity> extends UserIdRequest {
    @ApiProperty({ type: Object })
        item: DeepPartial<TEntity>
}

export class QueryRunnerUserIdRequest extends UserIdRequest {
    queryRunner: QueryRunner
}

export class CheckSufficientParams {
    @ApiProperty({ example: 50, description: "The current value (positive value)" })
        current: number

    @ApiProperty({ example: 50, description: "The required value (positive value)" })
        required: number
}

export class IdRequest {
    @IsUUID("4")
    @ApiProperty({ example: "5a6919c3-6ae3-45de-81eb-f1bbb05a246d" })
        id: string
}

@InputType({
    isAbstract: true
})
export abstract class PaginatedArgs {
    @Field(() => Int, { nullable: true, defaultValue: 10 }) //default 10
        limit?: number = 10
    @Field(() => Int, { nullable: true, defaultValue: 0 }) //default 0
        offset?: number = 0
}