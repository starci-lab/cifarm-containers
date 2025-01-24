import { ApiHideProperty, ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, IsUUID } from "class-validator"
import { Socket } from "socket.io"
import { DeepPartial, QueryRunner } from "typeorm"

export class UserIdRequest {
    @IsUUID("4")
    @ApiHideProperty()
        userId: string
}

export class NeighborAndUserIdRequest extends UserIdRequest {
    @IsUUID("4")
    @ApiProperty({ example: "e1f98d80-1f3f-43f5-b2d3-7436fded7d26" })
        neighborUserId: string
}

export interface UserIdParams {
     userId: string
}

export interface UserIdWithSocketParams extends UserIdParams {
    socket: Socket
}

export interface EntityParams<TEntity> {
    entity: DeepPartial<TEntity>
}

export interface EntityWithUserIdParams<TEntity> extends UserIdParams {
    entity: DeepPartial<TEntity>
}

export interface ArrayEntityParams<TEntity> {
    entities: Array<DeepPartial<TEntity>>
}

export interface ArrayEntityWithUserIdParams<TEntity> extends UserIdParams {
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

export class SocketConnectionParams  {
    @IsOptional()
    @IsString()
        clientId?: string
    @IsOptional()
    @IsUUID("4")
        userId?: string
}