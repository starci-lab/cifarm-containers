import { FirstCharLowerCaseTileId, TileId } from "@src/databases"
import { PositionInput } from "@src/gameplay"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class BuyTileRequest {
    @ValidateNested()
    @Type(() => PositionInput)
    @Field(() => PositionInput, { description: "The position of the tile" })
        position: PositionInput
    
    @IsString()
    @Field(() => FirstCharLowerCaseTileId, { description: "The id of the tile" })
        tileId: TileId
}