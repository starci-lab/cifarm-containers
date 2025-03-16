import { IsMongoId } from "class-validator"
import { InputType, Field } from "@nestjs/graphql"

@InputType()
export class HelpUsePesticideRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the tile to help use pesticide" })
        placedItemTileId: string
}