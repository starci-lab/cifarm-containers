import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"


@InputType()
export class UseAnimalFeedRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item animal" })
        placedItemAnimalId: string

    @IsMongoId()
    @Field(() => String, { description: "The ID of the inventory supply" })
        inventorySupplyId: string
}