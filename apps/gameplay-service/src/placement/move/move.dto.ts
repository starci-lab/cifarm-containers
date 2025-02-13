// buy-supplies.dto.ts

import { ApiProperty } from "@nestjs/swagger"
import {  UserIdRequest } from "@src/common"
import { Position } from "@src/gameplay"
import { IsMongoId } from "class-validator"

export class MoveRequest extends UserIdRequest {
    @IsMongoId()
    @ApiProperty({
        description: "The ID of the placed item to move",
        example: "5f3b7c9d4f9b8c001f3f7c8b"
    })
        placedItemId: string

    position: Position
}

export class MoveResponse {
    // This class is intentionally left empty for future extensions
}