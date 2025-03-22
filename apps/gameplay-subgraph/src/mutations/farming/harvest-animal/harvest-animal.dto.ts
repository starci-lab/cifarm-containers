import { IsInt, IsMongoId } from "class-validator"
import { InputType, Field, Int, ObjectType } from "@nestjs/graphql"

@InputType()
export class HarvestAnimalRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item animal" })
        placedItemAnimalId: string
}

@ObjectType()
export class HarvestAnimalResponse {
    @IsInt()
    @Field(() => Int, { description: "The quantity of the animal harvested" })
        quantity: number
}

