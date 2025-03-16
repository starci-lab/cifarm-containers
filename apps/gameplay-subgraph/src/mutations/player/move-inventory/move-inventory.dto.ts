import { Field, InputType } from "@nestjs/graphql"
import { IsBoolean, IsInt, IsMongoId, Min } from "class-validator"

@InputType()
export class MoveInventoryRequest {
    @IsBoolean()
    @Field(() => Boolean, { description: "Whether the inventory is a tool" })
        isTool: boolean

    @IsInt()
    @Min(0)
    @Field(() => Number, { description: "The index of the inventory to move" })
        index: number

    @IsMongoId()
    @Field(() => String, { description: "The id of the inventory to move" })
        inventoryId: string
}