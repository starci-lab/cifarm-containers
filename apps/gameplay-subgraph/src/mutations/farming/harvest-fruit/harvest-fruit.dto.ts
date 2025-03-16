import { IsInt, IsMongoId } from "class-validator"
import { Field, InputType, ObjectType, Int } from "@nestjs/graphql"

@InputType()
export class HarvestFruitRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item fruit" })
        placedItemFruitId: string
}

@ObjectType()
export class HarvestFruitResponse {
    @IsInt()
    @Field(() => Int, { description: "The quantity of the harvested fruit" })
        quantity: number
}
