import { ApiProperty } from "@nestjs/swagger"
import { NeighborAndUserIdRequest } from "@src/common"
import { IsInt, IsUUID } from "class-validator"

export class ThiefFruitRequest extends NeighborAndUserIdRequest {
    @IsUUID("4")
    @ApiProperty({ example: "e1f98d80-1f3f-43f5-b2d3-7436fded7d26" })
        placedItemFruitId: string
}

export class ThiefFruitResponse {
    @IsInt()
    @ApiProperty({ example: 1 })
        quantity: number
}