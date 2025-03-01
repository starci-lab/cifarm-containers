import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { TileId } from "@src/databases"
import { Position } from "@src/gameplay"
import { Type } from "class-transformer"
import { ValidateNested } from "class-validator"

export class BuyTileRequest extends UserIdRequest {
    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
    
    @ApiProperty({
        example: TileId.BasicTile,
    })
        tileId: TileId
}

export class BuyTileResponse {
    // This class is intentionally left empty for future extensions
}
