import { ApiProperty } from "@nestjs/swagger"
import { UserEntity } from "@src/database"
import { EntityRequest } from "@src/types"
import { IsInt } from "class-validator"
import { DeepPartial } from "typeorm"

export class AddEnergyRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @ApiProperty({
        example: 1,
        description: "The amount of energy to add (positive value)"
    })
        energy: number
}
export type AddEnergyResponse = DeepPartial<UserEntity>

export class SubstractEnergyRequest extends EntityRequest<UserEntity> {
    @IsInt()
    @ApiProperty({
        example: 3,
        description: "The amount of energy to substract (positive value)"
    })
        energy: number
}

export type SubstractEnergyResponse = DeepPartial<UserEntity>