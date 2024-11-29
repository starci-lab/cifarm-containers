import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "@src/database"
import { EntityParams } from "@src/types"
import { IsInt, Min } from "class-validator"
import { DeepPartial } from "typeorm"

export class AddParams extends EntityParams<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of token to add (positive value)"
    })
        amount: number
}

export type AddResult = DeepPartial<UserEntity>

export class SubtractParams extends EntityParams<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of token to subtract (positive value)"
    })
        amount: number
}

export type SubtractResult = DeepPartial<UserEntity>
