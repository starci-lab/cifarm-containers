import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class UseBugNetRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item fruit" })    
        placedItemFruitId: string
}