import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class HelpUseHerbicideRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the tile to help use herbicide" })
        placedItemTileId: string
}