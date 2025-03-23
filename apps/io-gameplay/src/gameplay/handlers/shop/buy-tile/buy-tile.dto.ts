import { TileId } from "@src/databases"
import { PositionInput } from "@src/gameplay"
import { Type } from "class-transformer"
import { IsEnum, ValidateNested } from "class-validator"

export class BuyTileMessage {
    @Type(() => PositionInput)
    @ValidateNested()
        position: PositionInput
    
    @IsEnum(TileId)
        tileId: TileId
} 