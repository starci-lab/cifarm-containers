import { Field, InputType } from "@nestjs/graphql"
import { IsMongoId } from "class-validator"

@InputType()
export class UsePesticideRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item tile" })
        placedItemTileId: string
}