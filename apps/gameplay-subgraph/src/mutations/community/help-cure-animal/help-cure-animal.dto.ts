import { IsMongoId } from "class-validator"
import { InputType, Field } from "@nestjs/graphql"

@InputType()
export class HelpCureAnimalRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the animal to help cure" })
        placedItemAnimalId: string
}