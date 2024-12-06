import { ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"
import { Position, UserIdRequest } from "@src/types"

export class PlaceTileRequest extends UserIdRequest {
    @IsUUID()
    @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
        inventoryTileId: string

    @ApiProperty({ type: Position })
        position: Position
}

export class PlaceTileResponse {}
