import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "@src/database"
import { EntityRequest } from "@src/types"
import { IsInt, IsNumber, Min } from "class-validator"
import { DeepPartial } from "typeorm"

export class AddBalanceRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to add (positive value)"
    })
    golds: number

    @IsNumber()
    @Min(0)
    @ApiProperty({
        example: 50.5,
        description: "The amount of tokens to add (positive value)"
    })
    tokens: number
}

export type AddBalanceResponse = DeepPartial<UserEntity>

export class SubtractBalanceRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to subtract (positive value)"
    })
    golds: number

    @IsNumber()
    @Min(0)
    @ApiProperty({
        example: 50.5,
        description: "The amount of tokens to subtract (positive value)"
    })
    tokens: number
}

export type SubtractBalanceResponse = DeepPartial<UserEntity>
