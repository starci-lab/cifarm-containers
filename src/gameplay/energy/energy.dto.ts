import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "@src/databases"
import { EntityParams } from "@src/common"
import { IsInt } from "class-validator"
import { DeepPartial } from "typeorm"

export class AddParams extends EntityParams<UserEntity> {
    @IsInt()
    @ApiProperty({
        example: 1,
        description: "The amount of energy to add (positive value)"
    })
        energy: number
}
export type AddResult = DeepPartial<UserEntity>

export class SubstractParams extends EntityParams<UserEntity> {
    @IsInt()
    @ApiProperty({
        example: 3,
        description: "The amount of energy to substract (positive value)"
    })
        energy: number
}

export type SubstractResult = DeepPartial<UserEntity>
