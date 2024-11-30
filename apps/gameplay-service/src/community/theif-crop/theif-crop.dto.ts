import { ApiProperty } from "@nestjs/swagger"
import { Empty, NeighborAndUserIdRequest } from "@src/types"
import { IsUUID } from "class-validator"

export class TheifCropRequest extends NeighborAndUserIdRequest {
    @IsUUID("4")
    @ApiProperty({ example: "e1f98d80-1f3f-43f5-b2d3-7436fded7d26" })
        placedItemTileId: string
}

export type TheifCropResponse = Empty