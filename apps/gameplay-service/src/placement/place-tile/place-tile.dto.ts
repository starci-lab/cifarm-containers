import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { Position } from "@src/gameplay"
import { IsUUID } from "class-validator"

export class PlaceTileRequest extends UserIdRequest {
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        inventoryTileId: string

    @ApiProperty({ type: Position })
        position: Position
}

export class PlaceTileResponse {
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        placedItemTileId : string
}
