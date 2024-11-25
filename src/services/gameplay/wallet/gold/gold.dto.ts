import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "@src/database"
import { EntityRequest } from "@src/types"
import { IsInt, Min } from "class-validator"
import { DeepPartial } from "typeorm"

export class AddRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to add (positive value)"
    })
    golds: number
}

export type AddResponse = DeepPartial<UserEntity>

export class SubtractRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to subtract (positive value)"
    })
    golds: number
}

export type SubtractResponse = DeepPartial<UserEntity>

export class CheckSufficientRequest {
    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold to check if sufficient (positive value)"
    })
    current: number

    @IsInt()
    @Min(0)
    @ApiProperty({
        example: 50,
        description: "The amount of gold required (positive value)"
    })
    required: number
}
