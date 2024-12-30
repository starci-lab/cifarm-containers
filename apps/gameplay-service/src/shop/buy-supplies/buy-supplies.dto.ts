// buy-supplies.dto.ts

import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsInt, IsString, Min } from "class-validator"

export class BuySuppliesRequest extends UserIdRequest {
    @ApiProperty({
        example: "BasicFertilizer",
        description: "The id of the supply to purchase"
    })
    @IsString()
        supplyId: string

    @ApiProperty({ example: 10, description: "The quantity of supplies to purchase" })
    @IsInt()
    @Min(1)
        quantity: number
}

export class BuySuppliesResponse {}
