import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class UseFruitFertilizerRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the inventory supply" })
        inventorySupplyId: string
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item fruit" })
        placedItemFruitId: string
}
