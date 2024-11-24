import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "@src/database"
import { EntityRequest } from "@src/types"
import { IsInt } from "class-validator"
import { DeepPartial } from "typeorm"

export class AddRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @ApiProperty({
        example: 1,
        description: "The amount of energy to add (positive value)"
    })
        energy: number
}
export type AddResponse = DeepPartial<UserEntity>

export class SubstractRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @ApiProperty({
        example: 3,
        description: "The amount of energy to substract (positive value)"
    })
        energy: number
}

export type SubstractResponse = DeepPartial<UserEntity>