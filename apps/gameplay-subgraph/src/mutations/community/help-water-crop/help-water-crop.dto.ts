import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType({
    description: "The request to help water a crop"
})    
export class HelpWaterCropRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the tile to help water" })
        placedItemTileId: string
}