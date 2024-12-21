// buy-supplies.dto.ts

import { ApiProperty } from "@nestjs/swagger"
import { Position, UserIdRequest } from "@src/types"
import { IsString } from "class-validator"

export class MoveRequest extends UserIdRequest {
    @IsString()
    @ApiProperty({
        example: "00000000-0000-0000-0000-000",
        description: "The id of the placed item to move"
    })
        placedItemId: string

    position: Position
}

export class MoveResponse {}