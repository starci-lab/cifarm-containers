import { IsInt, IsMongoId } from "class-validator"
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql"

@InputType()
export class HarvestPlantRequest {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the placed item tile" })
        placedItemTileId: string
}

@ObjectType()
export class HarvestPlantResponse {
    @IsInt()
    @Field(() => Int, { description: "The quantity of the harvested plant" })
        quantity: number
}
