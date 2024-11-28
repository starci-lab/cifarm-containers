import { ApiProperty } from "@nestjs/swagger"
import { Position, UserIdRequest } from "@src/types"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"

export class BuyTileRequest extends UserIdRequest {
    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class BuyTileResponse {
    @IsString()
    @ApiProperty({ example: "placed-item-id" })
        placedItemId: string
}