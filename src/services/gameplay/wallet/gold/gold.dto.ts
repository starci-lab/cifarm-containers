import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "@src/database"
import { EntityRequest } from "@src/types"
import { IsInt, Min } from "class-validator"
import { DeepPartial } from "typeorm"

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

export class SubtractGoldRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to subtract (positive value)"
    })
    golds: number
}

export type SubtractGoldResponse = DeepPartial<UserEntity>

export class CheckSufficientRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to check (positive value)"
    })
    golds: number
}

export class CheckSufficientResponse {
    @ApiProperty({
        example: true,
        description: "Whether the gold is enough"
    })
    isEnough: boolean
}
