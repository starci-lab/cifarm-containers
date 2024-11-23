// buy-supplies.dto.ts

import { ApiProperty } from "@nestjs/swagger"
import { Empty, UserIdRequest } from "@src/types"
import { IsInt, IsString, Min } from "class-validator"

export class BuySuppliesRequest extends UserIdRequest {
    @ApiProperty({
        example: "BasicFertilizer",
        description: "The id of the supply to purchase"
    })
    @IsString()
    id: string

    @ApiProperty({ example: 10, description: "The quantity of supplies to purchase" })
    @IsInt()
    @Min(1)
    quantity: number
}

export type BuySuppliesResponse = Empty
