import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class HelpUseFruitFertilizerRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the fruit to help use fertilizer" })
        placedItemFruitId: string

    @IsMongoId()
    @Field(() => String, { description: "The ID of the inventory supply to help use fertilizer" })
        inventorySupplyId: string
}
