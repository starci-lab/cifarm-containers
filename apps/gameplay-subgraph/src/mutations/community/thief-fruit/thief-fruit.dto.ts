import { IsInt, IsMongoId } from "class-validator"
import { InputType, Field, ObjectType } from "@nestjs/graphql"

@InputType()
export class ThiefFruitRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the fruit to steal" })
        placedItemFruitId: string
}

@ObjectType()
export class ThiefFruitResponse {
    @IsInt()
    @Field(() => Number, { description: "The quantity of fruit stolen" })
        quantity: number
}