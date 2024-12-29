import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common/types"
import { Position } from "@src/gameplay"
import { Type } from "class-transformer"
import { ValidateNested } from "class-validator"

export class BuyTileRequest extends UserIdRequest {
    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
}

export class BuyTileResponse {}
