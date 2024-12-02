// buy-supplies.dto.ts

import { ApiProperty } from "@nestjs/swagger"
import { Position, UserIdRequest } from "@src/types"
import { IsString } from "class-validator"

class PlacementMoveRequest extends UserIdRequest {
    @ApiProperty({
        example: "PlacedItemKey",
        description: "PlacedItemKey"
    })
    @IsString()
        placedItemKey:string    

    position: Position
}
export default PlacementMoveRequest