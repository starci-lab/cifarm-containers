// buy-seed.dto.ts

import { ApiProperty } from "@nestjs/swagger"
import { Empty, UserIdRequest } from "@src/types"
import { IsInt, IsString, Min } from "class-validator"

export class BuySeedsRequest extends UserIdRequest {
    @ApiProperty({ example: "Carrot", description: "The id of the seed to purchase" })
    @IsString()
    id: string

    @ApiProperty({ example: 10, description: "The quantity of seeds to purchase" })
    @IsInt()
    @Min(1)
    quantity: number
}

export type BuySeedsResponse = Empty
