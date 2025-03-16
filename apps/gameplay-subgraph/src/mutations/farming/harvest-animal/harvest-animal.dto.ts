import { IsMongoId } from "class-validator"
import { InputType, Field } from "@nestjs/graphql"

@InputType()
export class HarvestAnimalRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item animal" })
        placedItemAnimalId: string
}