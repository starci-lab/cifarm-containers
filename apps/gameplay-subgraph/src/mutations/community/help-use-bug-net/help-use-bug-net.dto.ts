import { IsMongoId } from "class-validator"
import { InputType, Field } from "@nestjs/graphql"

@InputType()
export class HelpUseBugNetRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the fruit to help use bug net" })
        placedItemFruitId: string
}