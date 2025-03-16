import { IsMongoId } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class RetainProductRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the inventory to retain" })
        inventoryId: string
}