import { ApiProperty } from "@nestjs/swagger"
import { Position, UserIdRequest } from "@src/types"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"

export class MoveRequest extends UserIdRequest {
    @ApiProperty({
        example: "5f3e2f4b-1c4d-4f3b-8e9d-5e9d4b4f3c4e",
        description: "The id of the place item tile to purchase"
    })
    @IsString()
        placedItemTileId: string

    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class MoveResponse {}
