import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "@src/database"
import { EntityRequest } from "@src/types"
import { IsInt, Min } from "class-validator"
import { DeepPartial } from "typeorm"

export class AddTokenRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of token to add (positive value)"
    })
    tokens: number
}

export type AddTokenResponse = DeepPartial<UserEntity>

export class SubtractTokenRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of token to subtract (positive value)"
    })
    tokens: number
}

export type SubtractTokenResponse = DeepPartial<UserEntity>
