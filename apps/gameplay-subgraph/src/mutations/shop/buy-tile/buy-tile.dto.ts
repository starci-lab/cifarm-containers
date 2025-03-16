import { TileId } from "@src/databases"
import { Position } from "@src/gameplay"
import { Type } from "class-transformer"
import { IsString, ValidateNested } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class BuyTileRequest {
    @ValidateNested()
    @Type(() => Position)
    @Field(() => Position, { description: "The position of the tile" })
        position: Position
    
    @IsString()
    @Field(() => String, { description: "The id of the tile" })
        tileId: TileId
}