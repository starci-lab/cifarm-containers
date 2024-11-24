import { ApiHideProperty, ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"
import { DeepPartial, QueryRunner } from "typeorm"

export class UserIdRequest {
    @IsUUID("4")
    @ApiHideProperty()
    userId: string
}

export class EntityRequest<TEntity> {
    entity: DeepPartial<TEntity>
}

export class EntityWithUserIdRequest<TEntity> extends UserIdRequest {
    entity: DeepPartial<TEntity>
}

export class ArrayEntityRequest<TEntity> {
    entities: Array<DeepPartial<TEntity>>
}

export class ArrayEntityWithUserIdRequest<TEntity> extends UserIdRequest {
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
