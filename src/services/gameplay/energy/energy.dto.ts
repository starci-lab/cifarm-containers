import { ApiProperty } from "@nestjs/swagger"
import { Empty, UserIdRequest } from "@src/types"
import { IsInt } from "class-validator"

export class AddEnergyRequest extends UserIdRequest {
    @IsInt()
    @ApiProperty({
        example: 1,
        description: "The amount of energy to add (positive value)"
    })
        energy: number
}
export type AddEnergyResponse = Empty

export class SubstractEnergyRequest extends UserIdRequest {
    @IsInt()
    @ApiProperty({
        example: 3,
        description: "The amount of energy to substract (positive value)"
    })
        energy: number
}

export type SubstractEnergyResponse = Empty