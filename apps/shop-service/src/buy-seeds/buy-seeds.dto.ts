// buy-seed.dto.ts

import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/types"
import { IsString, IsInt, Min } from "class-validator"

export class BuySeedsRequest extends UserIdRequest {
    @ApiProperty({ example: "Carrot", description: "The key of the seed to purchase" })
    @IsString()
        key: string

    @ApiProperty({ example: 10, description: "The quantity of seeds to purchase" })
    @IsInt()
    @Min(1)
        quantity: number

}

export class BuySeedsResponse {
    @ApiProperty({ example: "inventory-seed-key", description: "The inventory key for the purchased seeds" })
        inventoryKey: string
}
