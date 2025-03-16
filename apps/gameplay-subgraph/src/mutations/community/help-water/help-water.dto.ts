import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()    
export class HelpWaterRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the tile to help water" })
        placedItemTileId: string
}