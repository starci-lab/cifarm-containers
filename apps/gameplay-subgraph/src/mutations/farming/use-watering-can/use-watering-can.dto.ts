import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class UseWateringCanRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item tile" })
        placedItemTileId: string
}
