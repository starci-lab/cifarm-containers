import { IsInt, IsMongoId } from "class-validator"
import { InputType, Field, ObjectType } from "@nestjs/graphql"

@InputType()
export class ThiefAnimalRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the animal to steal product from" })
        placedItemAnimalId: string
}

@ObjectType()
export class ThiefAnimalResponse {
    @IsInt()
    @Field(() => Number, { description: "The quantity of product stolen" })
        quantity: number
}