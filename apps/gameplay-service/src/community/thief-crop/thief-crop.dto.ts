import { ApiProperty } from "@nestjs/swagger"
import { NeighborAndUserIdRequest } from "@src/types"
import { IsInt, IsUUID } from "class-validator"

export class ThiefCropRequest extends NeighborAndUserIdRequest {
    @IsUUID("4")
    @ApiProperty({ example: "e1f98d80-1f3f-43f5-b2d3-7436fded7d26" })
        placedItemTileId: string
}

export class ThiefCropResponse {
    @IsInt()
    @ApiProperty({ example: 1 })
        quantity: number
}