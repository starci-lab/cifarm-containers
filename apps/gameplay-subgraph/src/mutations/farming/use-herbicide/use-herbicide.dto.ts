import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class UseHerbicideRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item tile" })
        placedItemTileId: string
}