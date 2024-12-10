// buy-supplies.dto.ts

import { ApiProperty } from "@nestjs/swagger"
import { Position, UserIdRequest } from "@src/types"
import { IsString } from "class-validator"

class PlaceTitleRequest extends UserIdRequest {
    @ApiProperty({
        example: "uuids",
        description: "inventoryTileKey"
    })
    @IsString()
        inventoryTileKey :string    

    position: Position
}
class PlaceTileResponse {
    @ApiProperty({
        example: "uuids",
        description: "placedItemTileKey"
    })
    @IsString()
        placedItemTileKey: string
}
export default { PlaceTitleRequest , PlaceTileResponse} 