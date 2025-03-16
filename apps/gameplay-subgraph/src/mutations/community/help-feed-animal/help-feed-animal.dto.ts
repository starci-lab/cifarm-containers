import { Field, InputType } from "@nestjs/graphql"
import { IsMongoId } from "class-validator"

@InputType()
export class HelpFeedAnimalRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the animal to help feed" })
        placedItemAnimalId: string

    @IsMongoId()
    @Field(() => String, { description: "The ID of the inventory supply to help feed" })
        inventorySupplyId: string
}