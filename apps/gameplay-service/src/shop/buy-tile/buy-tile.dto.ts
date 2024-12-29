import { ApiProperty } from "@nestjs/swagger"
import { Position, UserIdRequest } from "@src/common/types"
import { Type } from "class-transformer"
import { ValidateNested } from "class-validator"

export class BuyTileRequest extends UserIdRequest {
    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class BuyTileResponse {}
