import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "@src/database"
import { Empty, EntityRequest, UserIdRequest } from "@src/types"
import { IsInt, Min } from "class-validator"
import { DeepPartial } from "typeorm"

export class GetGoldBalanceRequest extends UserIdRequest {}

export class GetGoldBalanceResponse {
    @IsInt()
    @ApiProperty({ example: 100, description: "The user's gold balance" })
    golds: number
}

export class AddGoldRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to add (positive value)"
    })
    golds: number
}

export type AddGoldResponse = DeepPartial<UserEntity>

export class SubtractGoldRequest extends UserIdRequest {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to subtract (positive value)"
    })
    golds: number
}

export type SubtractGoldResponse = Empty