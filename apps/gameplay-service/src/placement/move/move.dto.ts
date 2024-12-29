// buy-supplies.dto.ts

import { ApiProperty } from "@nestjs/swagger"
import {  UserIdRequest } from "@src/common/types"
import { Position } from "@src/gameplay"
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