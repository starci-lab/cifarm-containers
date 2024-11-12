// buy-supplies.dto.ts

import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/types"
import { IsString, IsInt, Min } from "class-validator"

export class BuySuppliesRequest extends UserIdRequest {
    @ApiProperty({ example: "supply-key", description: "The id of the supply to purchase" })
    @IsString()
        key: string

    @ApiProperty({ example: 10, description: "The quantity of supplies to purchase" })
    @IsInt()
    @Min(1)
        quantity: number
}

export class BuySuppliesResponse {
    @ApiProperty({ example: "inventory-key", description: "The inventory key for the purchased supplies" })
        inventoryKey: string
}
