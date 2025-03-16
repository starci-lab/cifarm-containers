import { Field, ObjectType } from "@nestjs/graphql"
import { InputType } from "@nestjs/graphql"
import { IsInt, IsMongoId } from "class-validator"

@InputType()   
export class SellRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item to sell" })
        placedItemId: string
}

@ObjectType()
export class SellResponse {
    @IsInt()
    @Field(() => Number, { description: "The quantity of the placed item to sell" })
        quantity: number
}