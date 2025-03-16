import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class PlantSeedRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the inventory seed" })
        inventorySeedId: string
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item tile" })
        placedItemTileId: string
}
