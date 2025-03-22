import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class CureAnimalRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item animal" })
        placedItemAnimalId: string
}