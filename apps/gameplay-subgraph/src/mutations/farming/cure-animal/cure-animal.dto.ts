import { IsUUID } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class CureAnimalRequest {
    @IsUUID()
    @Field(() => String, { description: "The ID of the placed item animal" })
        placedItemAnimalId: string
}