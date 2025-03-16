import { IsInt, IsMongoId } from "class-validator"
import { InputType, Field } from "@nestjs/graphql"

@InputType()
export class DeliverProductRequest {
    @IsInt()
    @Field(() => Number, { description: "The index of the product to deliver" })
        index: number

    @IsMongoId()
    @Field(() => String, { description: "The ID of the inventory to deliver" })
        inventoryId: string

    @IsInt()
    @Field(() => Number, { description: "The quantity of the product to deliver" })
        quantity: number
}